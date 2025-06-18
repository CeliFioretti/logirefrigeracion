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
import { useNavigate } from 'react-router-dom';

export default function TopBarAdmin({ nombre = "Adriana Rodríguez", rol = "Administrador" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
    navigate('/', { replace: true });
  };

  const goToConfig = () => navigate('/configuracion');
  const goToAyuda = () => navigate('/ayuda');

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#394867', zIndex: 1201 }}>
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        {/* Íconos */}
        <IconButton color="inherit" onClick={() => alert('Notificaciones')}>
          <NotificationsIcon />
        </IconButton>
        <IconButton color="inherit" onClick={goToAyuda}>
          <HelpOutlineIcon />
        </IconButton>
        <IconButton color="inherit" onClick={goToConfig}>
          <SettingsIcon />
        </IconButton>

        {/* Usuario */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Tooltip title="Cerrar sesión">
            <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ textAlign: 'right', mx: 2 }}>
            <Typography variant="body1">{nombre}</Typography>
            <Typography variant="caption" sx={{ color: '#ccc' }}>{rol}</Typography>
          </Box>
          <Avatar alt={nombre} src="/avatar-admin.png" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
