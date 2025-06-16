import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ roles }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/" />;
  if (roles && !roles.includes(rol)) return <Navigate to="/" />;

  return <Outlet />;
};

export default PrivateRoute;
