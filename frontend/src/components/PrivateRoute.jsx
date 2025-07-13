import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react'; 
import { UserContext } from '../context/UserContext';
import { CircularProgress, Box } from '@mui/material';

function PrivateRoute({ roles, children }) {
  const { usuario, loadingUser } = useContext(UserContext);
  const location = useLocation();

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
          <CircularProgress/>
      </Box>
    )
  }

  // Verifica si NO hay un usuario autenticado
  if (!usuario || !usuario.token) {
    return <Navigate to='/' replace state={{ from: location }} />
  }

  // Verificar los roles en caso de tener
  if (roles && roles.length > 0) {
    if (!usuario.rol || !roles.includes(usuario.rol)) {
      return <Navigate to='/acceso-denegado' replace />
    }
  }
  

  // Si el usuario está autenticado y tiene el rol correcto, renderiza el contenido
  return <Outlet />;
}

export default PrivateRoute;