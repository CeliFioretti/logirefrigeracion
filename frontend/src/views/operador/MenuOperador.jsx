import React, { useEffect, useContext, useState } from 'react'; 
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { UserContext } from '../../context/UserContext'; 
import axiosInstance from '../../api/axios'; 

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
  Badge, 
  Menu,
  MenuItem, 
  Divider 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { blue } from '@mui/material/colors'; 

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

  // Estados para las notificaciones
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // Para el menú de notificaciones
  const openNotificationsMenu = Boolean(anchorEl); // Booleano para controlar la apertura del menú

  useEffect(() => {
    document.title = 'Menú de Operador';
    if (!usuario || usuario.rol !== 'operador') {
      navigate('/', { replace: true });
    }
    fetchNotifications(); // Cargar notificaciones al montar el componente
    const intervalId = setInterval(fetchNotifications, 60000); // Actualizar cada minuto
    return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
  }, [usuario, navigate]); // Dependencias: usuario y navigate

  // Función para obtener notificaciones del backend
  const fetchNotifications = async () => {
    if (!usuario || !usuario.token) {
      setNotifications([]);
      setUnreadNotificationsCount(0);
      return;
    }
    try {
      const response = await axiosInstance.get('/notificaciones', {
        headers: {
          Authorization: `Bearer ${usuario.token}`
        }
      });
      const fetchedNotifications = response.data.data;
      setNotifications(fetchedNotifications);
      const unreadCount = fetchedNotifications.filter(notif => notif.leida === 0).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data?.error || error.message);
    }
  };

  // Manejadores para el menú de notificaciones
  const handleNotificationsBellClick = (event) => {
    setAnchorEl(event.currentTarget); // Establecer el ancla del menú
  };

  const handleNotificationsMenuClose = () => {
    setAnchorEl(null); // Cerrar el menú
  };

  // Marcar notificación como leída
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notificaciones/${notificationId}/leida`, {}, {
        headers: {
          Authorization: `Bearer ${usuario.token}`
        }
      });
      fetchNotifications(); // Volver a cargar para actualizar el conteo y estado
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data?.error || error.message);
    }
  };

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
            {/* Icono de Notificaciones */}
            <Tooltip title="Notificaciones">
              <IconButton color="inherit" sx={{ color: '#555' }} onClick={handleNotificationsBellClick}>
                <Badge badgeContent={unreadNotificationsCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            {/* Icono de Ayuda */}
            <Tooltip title="Ayuda">
              <IconButton color="inherit" sx={{ color: '#555' }} component={RouterLink} to="/ayuda">
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
            {/* Icono de Ajustes/Configuración */}
            <Tooltip title="Ajustes">
              <IconButton color="inherit" sx={{ color: '#555' }} component={RouterLink} to="/operador/configuracion">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            {usuario && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Avatar sx={{ bgcolor: blue[500], width: 32, height: 32, fontSize: '0.9rem' }}>
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

      {/* Menú desplegable de notificaciones */}
      <Menu
        anchorEl={anchorEl}
        open={openNotificationsMenu}
        onClose={handleNotificationsMenuClose}
        onClick={handleNotificationsMenuClose} // Cierra el menú al hacer clic en cualquier parte
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'auto',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
            minWidth: 300,
            maxHeight: 400,
            borderRadius: '8px',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="subtitle1" sx={{ p: 1, fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
          Notificaciones ({unreadNotificationsCount} no leídas)
        </Typography>
        <Divider sx={{ my: 0.5 }} />
        {notifications.length === 0 ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            No hay notificaciones.
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((notif) => ( 
            <MenuItem
              key={notif.id}
              onClick={() => {
                handleMarkAsRead(notif.id);
              }}
              sx={{
                borderBottom: '1px solid #eee',
                '&:last-child': { borderBottom: 'none' },
                fontWeight: notif.leida === 0 ? 'bold' : 'normal',
                backgroundColor: notif.leida === 0 ? '#e3f2fd' : 'inherit',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                py: 1,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.primary">
                  {notif.titulo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notif.mensaje}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {new Date(notif.fecha_creacion).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        {notifications.length > 0 && (
          <MenuItem onClick={() => {
            handleNotificationsMenuClose();
            navigate('/operador/notificaciones'); // Navegar a la vista completa de notificaciones del operador
          }}>
            <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
              Ver todas las notificaciones
            </Typography>
          </MenuItem>
        )}
      </Menu>

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

          <Grid item xs={12} sm={6}> 
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/mantenimientos-pendientes">
              <DirectionsCarFilledIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Mantenimientos pendientes
              </Typography>
            </ButtonBase>
          </Grid>
          <Grid item xs={12} sm={6}>
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/zonas-asignadas">
              <LocationOnIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Zonas asignadas
              </Typography>
            </ButtonBase>
          </Grid>


          <Grid item xs={12} sm={6}>
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/historial-eventos">
              <HistoryIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Historial de eventos
              </Typography>
            </ButtonBase>
          </Grid>
          <Grid item xs={12} sm={6}>
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/registrar-evento">
              <EventNoteIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Registrar Entrega/Retiro
              </Typography>
            </ButtonBase>
          </Grid>


          <Grid item xs={12} sm={6}>
            <ButtonBase sx={menuButtonStyle} component={RouterLink} to="/operador/configuracion">
              <SettingsIcon sx={iconStyle} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Configuración
              </Typography>
            </ButtonBase>
          </Grid>
          <Grid item xs={12} sm={6}>
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