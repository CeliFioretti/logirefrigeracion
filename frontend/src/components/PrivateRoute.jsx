import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react'; 
import { UserContext } from '../context/UserContext';

function PrivateRoute({ roles }) {
  const { usuario } = useContext(UserContext);

  // Verifica si hay un usuario y si su rol está incluido en los roles permitidos
  if (!usuario || !roles.includes(usuario.rol)) {
    // Si no hay usuario o el rol no es permitido, redirige al login
    return <Navigate to="/" replace />;
  }

  // Si el usuario está autenticado y tiene el rol correcto, renderiza el contenido
  return <Outlet />;
}

export default PrivateRoute;