import React, { useEffect, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

// Material-UI Components
import {
  Box,
  Typography,
  Paper,
  Grid,
  ButtonBase, 
  Avatar,
  Toolbar,
  AppBar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Material-UI Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'; 
import LocationOnIcon from '@mui/icons-material/LocationOn'; 
import HistoryIcon from '@mui/icons-material/History'; 
import EventNoteIcon from '@mui/icons-material/EventNote'; 
import ScheduleIcon from '@mui/icons-material/Schedule'; 

function MenuOperador() {
  const { usuario, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    document.title = 'Menú de Operador';
    if (!usuario || usuario.rol !== 'operador') {
      navigate('/', { replace: true });
    }
  }, [usuario, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Estilo común para los botones del menú
  const menuButtonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: isSmallScreen ? '100%' : '150px', 
    height: isSmallScreen ? '120px' : '150px',
    padding: theme.spacing(2),
    textAlign: 'center',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: theme.shadows[3],
    },
    color: '#333', 
    backgroundColor: 'white', 
    border: '1px solid #eee', 
  };

  const iconStyle = {
    fontSize: isSmallScreen ? '3.5rem' : '4rem', 
    color: '#5f85db', 
    marginBottom: theme.spacing(1),
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isSmallScreen ? theme.spacing(2) : theme.spacing(4),
      }}
    >
      {/* AppBar / Header */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ width: '100%', maxWidth: '1200px', marginBottom: theme.spacing(3) }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#333' }}>
            Modelez SRL
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notificaciones">
              <IconButton color="inherit" sx={{ color: '#555' }}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ayuda">
              <IconButton color="inherit" sx={{ color: '#555' }}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ajustes">
              <IconButton color="inherit" sx={{ color: '#555' }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            {usuario && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Avatar sx={{ bgcolor: '#9bcbe0', width: 32, height: 32, fontSize: '0.9rem' }}>
                  {usuario.nombre ? usuario.nombre[0].toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                    {usuario.nombre}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#777', fontSize: '0.8rem' }}>
                    Operador
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido principal del menú */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '800px', // Limitar el ancho en pantallas grandes
          padding: theme.spacing(isSmallScreen ? 2 : 4),
          borderRadius: '15px',
          backgroundColor: 'white',
          textAlign: 'center',
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{
            fontWeight: 'bold',
            color: '#333',
            marginBottom: theme.spacing(4),
            textTransform: 'uppercase',
            fontSize: isSmallScreen ? '1.8rem' : '2.5rem',
        }}>
          Bienvenido de nuevo
        </Typography>

        <Grid container spacing={isSmallScreen ? 2 : 3} justifyContent="center">
          
          <Grid >
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/mantenimientos-pendientes">
              <DirectionsCarFilledIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Mantenimientos pendientes
              </Typography>
            </ButtonBase>
          </Grid>
          <Grid >
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/zonas-asignadas">
              <LocationOnIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Zonas asignadas
              </Typography>
            </ButtonBase>
          </Grid>


          <Grid >
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/historial-eventos">
              <HistoryIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Historial de eventos
              </Typography>
            </ButtonBase>
          </Grid>
          <Grid >
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/registrar-evento">
              <EventNoteIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Registrar Entrega/Retiro
              </Typography>
            </ButtonBase>
          </Grid>


          <Grid >
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/configuracion">
              <SettingsIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Configuración
              </Typography>
            </ButtonBase>
          </Grid>
          <Grid >
            <ButtonBase sx={menuButtonStyle} disabled> {/* Proximamente */}
              <ScheduleIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Próximamente
              </Typography>
            </ButtonBase>
          </Grid>
        </Grid>

        {/* Botón de Cerrar Sesión */}
        <Box sx={{ marginTop: theme.spacing(4), width: '100%' }}>
          <ButtonBase
            onClick={handleLogout}
            sx={{
              ...menuButtonStyle, 
              width: isSmallScreen ? '100%' : 'auto', 
              padding: theme.spacing(1, 4),
              backgroundColor: '#f44336', 
              color: 'white',
              boxShadow: theme.shadows[2],
              '&:hover': {
                backgroundColor: '#d32f2f',
                transform: 'scale(1.03)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: '2rem', marginRight: theme.spacing(1) }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Cerrar sesión
            </Typography>
          </ButtonBase>
        </Box>
      </Paper>
    </Box>
  );
}

export default MenuOperador;