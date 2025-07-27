import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { useTheme } from '@mui/material';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { blue } from '@mui/material/colors';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AppsIcon from '@mui/icons-material/Apps';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import axiosInstance from '../api/axios';

const AdminIcon = SupervisorAccountIcon;
const OperadorIcon = PersonIcon;

export default function TopBarAdmin({ toggleSideNav, toggleMobileMenu, isLargeScreen, mobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useContext(UserContext);
  const nombreUsuario = usuario ? usuario.nombre : 'Invitado';
  const rolUsuario = usuario ? usuario.rol : '';

  const theme = useTheme();

  const [openMenus, setOpenMenus] = useState({
    freezers: false,
    clientes: false,
    mantenimientos: false,
    asignacionesmantenimiento: false,
    usuarios: false,
    gestionUsuarios: false,
    eventos: false,
    zonas: false,
    auditoria: false,
  });

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openNotificationsMenu = Boolean(anchorEl);

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

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, [usuario]);

  const handleNotificationsBellClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuClose = () => {
    setAnchorEl(null);
  };

  const goToDashboard = () => {
      navigate('/admin-dashboard');
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notificaciones/${notificationId}/leida`, {}, {
        headers: {
          Authorization: `Bearer ${usuario.token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data?.error || error.message);
    }
  };

  const handleToggle = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const goToConfig = () => navigate('/configuracion');

  const goToAyuda = () => navigate('/ayuda');

  const handleMobileNavigation = (path) => {
    navigate(path);
    toggleMobileMenu();
  };

  const primaryColor = '#1a237e';
  const secondaryColor = '#3f51b5';
  const lightGrey = '#f0f2f5';
  const darkGrey = '#cfd8dc';
  const activeBgColor = '#e3f2fd';
  const activeTextColor = primaryColor;
  const activeIconColor = primaryColor;

  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  const drawerContent = (
    <Box sx={{ p: 2, pb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: primaryColor, mb: 2 }}>
        Menú de Navegación
      </Typography>
      <Divider sx={{ mb: 2, borderColor: darkGrey }} />
      <List
        sx={{
          '& .MuiListItemButton-root': {
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
            '&:hover': {
              backgroundColor: darkGrey,
              color: primaryColor,
              '& .MuiListItemIcon-root': {
                color: primaryColor,
              }
            },
          },
          '& .Mui-selected': {
            backgroundColor: activeBgColor,
            color: activeTextColor,
            fontWeight: 'bold',
            '& .MuiListItemIcon-root': {
              color: activeIconColor,
            },
            '&:hover': {
              backgroundColor: activeBgColor,
            }
          },
          '& .MuiCollapse-wrapperInner .MuiListItemButton-root': {
            pl: 4,
            '&.Mui-selected': {
              borderLeft: `4px solid ${primaryColor}`,
              pl: 'calc(32px - 4px)',
              backgroundColor: '#c1d9f0',
            }
          }
        }}
      >
        {/* INICIO */}
        <ListItemButton
          onClick={() => handleMobileNavigation('/admin-dashboard')}
          selected={isActive('/admin-dashboard')}
        >
          <ListItemIcon><AppsIcon sx={{ color: isActive('/admin-dashboard') ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Inicio" sx={{ fontWeight: isActive('/admin-dashboard') ? 'bold' : 'normal', color: isActive('/admin-dashboard') ? activeTextColor : primaryColor }} />
        </ListItemButton>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* FREEZERS */}
        <ListItemButton
          onClick={() => handleToggle('freezers')}
          selected={isParentActive(['/freezers/listado', '/freezers/nuevo', '/freezers/buscar'])}
        >
          <ListItemIcon><AcUnitIcon sx={{ color: isParentActive(['/freezers/listado', '/freezers/nuevo', '/freezers/buscar']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Freezers" sx={{ fontWeight: isParentActive(['/freezers/listado', '/freezers/nuevo', '/freezers/buscar']) ? 'bold' : 'normal', color: isParentActive(['/freezers/listado', '/freezers/nuevo', '/freezers/buscar']) ? activeTextColor : primaryColor }} />
          {openMenus.freezers ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.freezers || isParentActive(['/freezers/listado', '/freezers/nuevo', '/freezers/buscar'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/freezers/listado')} selected={isActive('/freezers/listado')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/freezers/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Listado" sx={{ fontWeight: isActive('/freezers/listado') ? 'bold' : 'normal', color: isActive('/freezers/listado') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/freezers/nuevo')} selected={isActive('/freezers/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/freezers/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo freezer" sx={{ fontWeight: isActive('/freezers/nuevo') ? 'bold' : 'normal', color: isActive('/freezers/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/freezers/buscar')} selected={isActive('/freezers/buscar')}>
              <ListItemIcon><SearchIcon sx={{ color: isActive('/freezers/buscar') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Buscar freezer" sx={{ fontWeight: isActive('/freezers/buscar') ? 'bold' : 'normal', color: isActive('/freezers/buscar') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* CLIENTES */}
        <ListItemButton
          onClick={() => handleToggle('clientes')}
          selected={isParentActive(['/clientes/listado', '/clientes/nuevo', '/clientes/buscar'])}
        >
          <ListItemIcon><PeopleAltIcon sx={{ color: isParentActive(['/clientes/listado', '/clientes/nuevo', '/clientes/buscar']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Clientes" sx={{ fontWeight: isParentActive(['/clientes/listado', '/clientes/nuevo', '/clientes/buscar']) ? 'bold' : 'normal', color: isParentActive(['/clientes/listado', '/clientes/nuevo', '/clientes/buscar']) ? activeTextColor : primaryColor }} />
          {openMenus.clientes ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.clientes || isParentActive(['/clientes/listado', '/clientes/nuevo', '/clientes/buscar'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/clientes/listado')} selected={isActive('/clientes/listado')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/clientes/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Listar clientes" sx={{ fontWeight: isActive('/clientes/listado') ? 'bold' : 'normal', color: isActive('/clientes/listado') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/clientes/nuevo')} selected={isActive('/clientes/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/clientes/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo cliente" sx={{ fontWeight: isActive('/clientes/nuevo') ? 'bold' : 'normal', color: isActive('/clientes/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/clientes/buscar')} selected={isActive('/clientes/buscar')}>
              <ListItemIcon><SearchIcon sx={{ color: isActive('/clientes/buscar') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Buscar cliente" sx={{ fontWeight: isActive('/clientes/buscar') ? 'bold' : 'normal', color: isActive('/clientes/buscar') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* MANTENIMIENTOS */}
        <ListItemButton
          onClick={() => handleToggle('mantenimientos')}
          selected={isParentActive(['/mantenimientos/listado', '/mantenimientos/nuevo'])}
        >
          <ListItemIcon><AccessAlarmsIcon sx={{ color: isParentActive(['/mantenimientos/listado', '/mantenimientos/nuevo']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Mantenimientos" sx={{ fontWeight: isParentActive(['/mantenimientos/listado', '/mantenimientos/nuevo']) ? 'bold' : 'normal', color: isParentActive(['/mantenimientos/listado', '/mantenimientos/nuevo']) ? activeTextColor : primaryColor }} />
          {openMenus.mantenimientos ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.mantenimientos || isParentActive(['/mantenimientos/listado', '/mantenimientos/nuevo'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/mantenimientos/listado')} selected={isActive('/mantenimientos/listado')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/mantenimientos/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Historial" sx={{ fontWeight: isActive('/mantenimientos/listado') ? 'bold' : 'normal', color: isActive('/mantenimientos/listado') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/mantenimientos/nuevo')} selected={isActive('/mantenimientos/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/mantenimientos/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Registrar nuevo" sx={{ fontWeight: isActive('/mantenimientos/nuevo') ? 'bold' : 'normal', color: isActive('/mantenimientos/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* ASIGNACIONES DE MANTENIMIENTO */}
        <ListItemButton
          onClick={() => handleToggle('asignacionesmantenimiento')}
          selected={isParentActive(['/asignaciones-mantenimiento/listado', '/asignaciones-mantenimiento/nuevo'])}
        >
          <ListItemIcon><AccessAlarmsIcon sx={{ color: isParentActive(['/asignaciones-mantenimiento/listado', '/asignaciones-mantenimiento/nuevo']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Asignaciones Mant" sx={{ fontWeight: isParentActive(['/asignacionesmantenimiento', '/asignaciones-mantenimiento/nuevo']) ? 'bold' : 'normal', color: isParentActive(['/asignaciones-mantenimiento/listado', '/asignaciones-mantenimiento/nuevo']) ? activeTextColor : primaryColor }} />
          {openMenus.asignacionesmantenimiento ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.asignacionesmantenimiento || isParentActive(['/asignaciones-mantenimiento/listado', '/asignaciones-mantenimiento/nuevo'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/asignaciones-mantenimiento/listado')} selected={isActive('/asignaciones-mantenimiento/listado')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/asignaciones-mantenimiento/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Historial" sx={{ fontWeight: isActive('/asignaciones-mantenimiento/listado') ? 'bold' : 'normal', color: isActive('/asignaciones-mantenimiento/listado') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/asignaciones-mantenimiento/nuevo')} selected={isActive('/asignaciones-mantenimiento/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/asignaciones-mantenimiento/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Registrar nueva" sx={{ fontWeight: isActive('/asignaciones-mantenimiento/nuevo') ? 'bold' : 'normal', color: isActive('/asignaciones-mantenimiento/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* USUARIOS */}
        <ListItemButton
          onClick={() => handleToggle('usuarios')}
          selected={isParentActive(['/usuarios', '/usuarios/crear', '/usuarios/administradores/listado', '/usuarios/operadores'])}
        >
          <ListItemIcon><AccountCircleIcon sx={{ color: isParentActive(['/usuarios', '/usuarios/crear', '/usuarios/administradores/listado', '/usuarios/operadores']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Usuarios" sx={{ fontWeight: isParentActive(['/usuarios', '/usuarios/crear', '/usuarios/administradores/listado', '/usuarios/operadores']) ? 'bold' : 'normal', color: isParentActive(['/usuarios', '/usuarios/crear', '/usuarios/administradores/listado', '/usuarios/operadores']) ? activeTextColor : primaryColor }} />
          {openMenus.usuarios ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.usuarios || isParentActive(['/usuarios', '/usuarios/crear', '/usuarios/administradores/listado', '/usuarios/operadores'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            {/* GESTIÓN DE USUARIOS */}
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => handleToggle('gestionUsuarios')}
              selected={isParentActive(['/usuarios/administradores/listado', '/usuarios/operadores/listado'])}
            >
              <ListItemIcon><ListAltIcon sx={{ color: isParentActive(['/usuarios/administradores/listado', '/usuarios/operadores/listado']) ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Gestión de usuarios" sx={{ fontWeight: isParentActive(['/usuarios/administradores/listado', '/usuarios/operadores/listado']) ? 'bold' : 'normal', color: isParentActive(['/usuarios/administradores/listado', '/usuarios/operadores/listado']) ? activeTextColor : primaryColor }} />
              {openMenus.gestionUsuarios ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
            </ListItemButton>
            <Collapse in={openMenus.gestionUsuarios || isParentActive(['/usuarios/administradores/listado', '/usuarios/operadores/listado'])} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>

                {/* ADMINISTRADORES */}
                <ListItemButton sx={{ pl: 6 }} onClick={() => handleMobileNavigation('/usuarios/administradores/listado')} selected={isActive('/usuarios/administradores/listado')}>
                  <ListItemIcon><AdminIcon sx={{ color: isActive('/usuarios/administradores/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
                  <ListItemText primary="Administradores" sx={{ fontWeight: isActive('/usuarios/administradores/listado') ? 'bold' : 'normal', color: isActive('/usuarios/administradores/listado') ? activeTextColor : primaryColor }} />
                </ListItemButton>

                {/* OPERADORES */}
                <ListItemButton sx={{ pl: 6 }} onClick={() => handleMobileNavigation('/usuarios/operadores/listado')} selected={isActive('/usuarios/operadores/listado')}>
                  <ListItemIcon><OperadorIcon sx={{ color: isActive('/usuarios/operadores/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
                  <ListItemText primary="Operadores" sx={{ fontWeight: isActive('/usuarios/operadores/listado') ? 'bold' : 'normal', color: isActive('/usuarios/operadores/listado') ? activeTextColor : primaryColor }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* CODIGOS DE REGISTRO */}
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/usuarios/codigos-registro')} selected={isActive('/usuarios/codigos-registro')}>
              <ListItemIcon><VpnKeyIcon sx={{ color: isActive('/usuarios/codigos-registro') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Códigos de Registro" sx={{ fontWeight: isActive('/usuarios/codigos-registro') ? 'bold' : 'normal', color: isActive('/usuarios/codigos-registro') ? activeTextColor : primaryColor }} />
            </ListItemButton>

          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* EVENTOS */}
        <ListItemButton
          onClick={() => handleToggle('eventos')}
          selected={isParentActive(['/eventos/listado', '/eventos/nuevo'])}
        >
          <ListItemIcon><AssignmentTurnedInIcon sx={{ color: isParentActive(['/eventos/listado', '/eventos/nuevo']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Eventos" sx={{ fontWeight: isParentActive(['/eventos/listado', '/eventos/nuevo']) ? 'bold' : 'normal', color: isParentActive(['/eventos/listado', '/eventos/nuevo']) ? activeTextColor : primaryColor }} />
          {openMenus.eventos ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.eventos || isParentActive(['/eventos/listado', '/eventos/nuevo'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/eventos/listado')} selected={isActive('/eventos/listado')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/eventos/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Todos los eventos" sx={{ fontWeight: isActive('/eventos/listado') ? 'bold' : 'normal', color: isActive('/eventos/listado') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/eventos/nuevo')} selected={isActive('/eventos/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/eventos/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo evento" sx={{ fontWeight: isActive('/eventos/nuevo') ? 'bold' : 'normal', color: isActive('/eventos/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* ZONAS */}
        <ListItemButton
          onClick={() => handleToggle('zonas')}
          selected={isParentActive(['/ubicaciones/departamentos/listado', '/ubicaciones/crear'])}
        >
          <ListItemIcon><LocationOnIcon sx={{ color: isParentActive(['/ubicaciones/departamentos/listado', '/ubicaciones/crear']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Zonas" sx={{ fontWeight: isParentActive(['/ubicaciones/departamentos/listado', '/ubicaciones/crear']) ? 'bold' : 'normal', color: isParentActive(['/ubicaciones/departamentos/listado', '/ubicaciones/crear']) ? activeTextColor : primaryColor }} />
          {openMenus.zonas ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.zonas || isParentActive(['/ubicaciones/departamentos/listado', '/ubicaciones/crear'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/ubicaciones/departamentos/listado')} selected={isActive('/ubicaciones/departamentos/listado')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/ubicaciones/departamentos/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Departamentos" sx={{ fontWeight: isActive('/ubicaciones/departamentos/listado') ? 'bold' : 'normal', color: isActive('/ubicaciones/departamentos/listado') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/ubicaciones/crear')} selected={isActive('/ubicaciones/crear')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/ubicaciones/crear') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo Departamento" sx={{ fontWeight: isActive('/ubicaciones/crear') ? 'bold' : 'normal', color: isActive('/ubicaciones/crear') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* AUDITORÍA */}
        <ListItemButton
          onClick={() => handleToggle('auditoria')}
          selected={isActive('/auditoria/listado')}
        >
          <ListItemIcon><FactCheckIcon sx={{ color: isActive('/auditoria/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Auditoría" sx={{ fontWeight: isActive('/auditoria/listado') ? 'bold' : 'normal', color: isActive('/auditoria/listado') ? activeTextColor : primaryColor }} />
          {openMenus.auditoria ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.auditoria || isActive('/auditoria/listado')} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/auditoria/listado')} selected={isActive('/auditoria/listado')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/auditoria/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Ver registros" sx={{ fontWeight: isActive('/auditoria/listado') ? 'bold' : 'normal', color: isActive('/auditoria/listado') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#394867',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
        ml: 0
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Contenedor clicable para el ícono de menú y el nombre de la empresa */}
          <Box
            onClick={goToDashboard} 
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer', 
              '&:hover': {
                opacity: 0.8, 
              }
            }}
          >
            <IconButton
              color="inherit"
              aria-label='open drawer'
              edge="start"
              onClick={isLargeScreen ? toggleSideNav : toggleMobileMenu}
              sx={{ mr: 1 }} 
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                display: { xs: 'none', sm: 'block' }, 
                color: 'white', 
              }}
            >
              Logirefrigeracion
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={handleNotificationsBellClick}>
            <Badge badgeContent={unreadNotificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
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
            <Typography variant="body1">{nombreUsuario}</Typography>
            <Typography variant="caption" sx={{ color: '#ccc', textTransform: 'capitalize' }}>{rolUsuario}</Typography>
          </Box>
          <Avatar alt={nombreUsuario} sx={{ bgcolor: blue[500] }}>{nombreUsuario[0]}</Avatar>
        </Box>
      </Toolbar>
      <Menu
        anchorEl={anchorEl}
        open={openNotificationsMenu}
        onClose={handleNotificationsMenuClose}
        onClick={handleNotificationsMenuClose}
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
        {notifications.length === 0 ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            No hay notificaciones.
          </MenuItem>
        ) : (
          notifications.slice(0, 4).map((notif) => (
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
            navigate('/notificaciones/listado');
          }}>
            <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
              Ver todas las notificaciones
            </Typography>
          </MenuItem>
        )}
      </Menu>
      {!isLargeScreen && (
        <Drawer
          variant="temporary"
          anchor="top"
          open={mobileMenuOpen}
          onClose={toggleMobileMenu}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: '100%',
              backgroundColor: lightGrey,
              color: primaryColor,
              boxShadow: theme.shadows[4]
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </AppBar>
  );
}