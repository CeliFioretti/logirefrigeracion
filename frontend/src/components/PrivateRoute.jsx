import { Navigate, Outlet } from 'react-router-dom';

function PrivateRoute({ roles }) {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token || !roles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;
