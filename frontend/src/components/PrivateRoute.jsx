import { Navigate, Outlet } from 'react-router-dom';

function PrivateRoute({ roles }) {
  const token = sessionStorage.getItem('token');
  const rol = sessionStorage.getItem('rol');

  if (!token || !roles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;
