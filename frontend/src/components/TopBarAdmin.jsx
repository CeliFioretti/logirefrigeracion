import { useNavigate } from 'react-router-dom';

// Estilos e íconos
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

import { useContext } from 'react';
import { UserContext } from '../context/UserContext'



export default function TopBarAdmin({ toggleDrawer }) {
  // Comprobar el UserContext
  const userContextData = useContext(UserContext);
  console.log('Contexto:', userContextData);

  const navigate = useNavigate();
  const { usuario } = useContext(UserContext);
  const nombre = usuario?.nombre || "Usuario";
  const rol = usuario?.rol || "Rol";


  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
    navigate('/', { replace: true });
  };

  const goToConfig = () => navigate('/configuracion');
  const goToAyuda = () => navigate('/ayuda');

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#394867', zIndex: 1201 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => {
              toggleDrawer();
            }}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Elementos de la derecha */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={() => alert('Notificaciones')}>
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={goToAyuda}>
            <HelpOutlineIcon />
          </IconButton>
          <IconButton color="inherit" onClick={goToConfig}>
            <SettingsIcon />
          </IconButton>

          <Tooltip title="Cerrar sesión">
            <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ textAlign: 'right', mx: 2 }}>
            <Typography variant="body1">{nombre}</Typography>
            <Typography variant="caption" sx={{ color: '#ccc' }}>{rol}</Typography>
          </Box>
          <Avatar alt={nombre} />
        </Box>
      </Toolbar>


    </AppBar>
  );
}
