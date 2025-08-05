import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserService } from '../services/UserService';
import { setAuthToken } from '../api';
import { isTokenExpired } from '../utils/utils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setAuthToken(null);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    setAuthToken(token);

    try {
      const { data } = await UserService.getMe();
      setUser(data);
    } catch (error) {
      logout();
    }
  }, [token, logout]);

  const checkTokenExpiration = useCallback(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token, logout]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  const login = async (email, password) => {
    try {
      const { status, data } = await UserService.login({ email, password });

      if (status === 200 && data.token) {
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
        setToken(data.token);
        return { success: true };
      }

      return { success: false, message: 'Credenciais inválidas' };
    } catch (error) {
      const message = error?.response?.data?.message || 'Erro ao fazer login';
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
