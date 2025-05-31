// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = () => {
  const { user ,loading } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
 if (loading) return <p>Loading...</p>;
  return <Outlet />; 
};

export default ProtectedRoute;
