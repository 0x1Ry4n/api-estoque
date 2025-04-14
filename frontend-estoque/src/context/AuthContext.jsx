import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api';
import { isTokenExpired } from '../utils/utils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        logout();
      }
    };

    checkTokenExpiration();

    const interval = setInterval(checkTokenExpiration, 60000); 
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setAuthToken(token); 
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error("Erro ao buscar user:", err);
          logout();
        }
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.status === 200) {
        const { token } = response.data;
        setToken(token);
        localStorage.setItem('token', token);
        setAuthToken(token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro ao fazer login: ", error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
