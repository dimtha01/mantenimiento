import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = JSON.parse(userStr);
      const userRole = user?.rol; // "ADMIN" / "USER"
      
      if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/no-autorizado" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
