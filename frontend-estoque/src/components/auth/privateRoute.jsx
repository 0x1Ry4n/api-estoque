import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setAuthToken } from '../../api';
import { isTokenExpired } from '../../utils/utils';

const PrivateRoute = ({ children, onlyAdmin = false }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  setAuthToken(token);

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  if (onlyAdmin && user?.role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;
