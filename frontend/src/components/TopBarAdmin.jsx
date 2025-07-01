import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext'
import { useTheme } from '@mui/material';

// Estilos e íconos de Material-UI
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
  Collapse
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { blue } from '@mui/material/colors';

// Iconos para el menú (se usan en el drawer móvil)
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AppsIcon from '@mui/icons-material/Apps';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LocationPinIcon from '@mui/icons-material/LocationOn';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function TopBarAdmin({ toggleSideNav, toggleMobileMenu, isLargeScreen, mobileMenuOpen }) {
  const navigate = useNavigate();
  const { usuario, logout } = useContext(UserContext);
  const nombreUsuario = usuario ? usuario.nombre : 'Invitado';
  const rolUsuario = usuario ? usuario.rol : '';

  const theme = useTheme();

  const [openMenus, setOpenMenus] = useState({
    freezers: false,
    clientes: false,
    mantenimientos: false,
    usuarios: false,
    eventos: false,
    zonas: false,
    auditoria: false,
  });

  const handleToggle = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true });
  };

  const goToConfig = () => navigate('/configuracion');
  const goToAyuda = () => navigate('/ayuda');

  // Función para manejar la navegación en el menú móvil
  const handleMobileNavigation = (path) => {
    navigate(path);
    toggleMobileMenu(); // Cierra el Drawer luego de navegar
  }

  const iconColor = '#14274E';
  const textColor = '#14274E';
  const solidDrawerBgColor = '#e1e7ee';

  const drawerContent = (
    <div>
      <List>
        {/* INICIO */}
        <ListItemButton onClick={() => handleMobileNavigation('/dashboard')}>
          <ListItemIcon><AppsIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItemButton>

        {/* FREEZERS */}
        <ListItemButton onClick={() => handleToggle('freezers')}>
          <ListItemIcon><AcUnitIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Freezers" />
          {openMenus.freezers ? <ExpandLess sx={{ color: iconColor }} /> : <ExpandMore sx={{ color: iconColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.freezers} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/freezers')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Listado" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/freezers/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo freezer" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/freezers/buscar')}>
              <ListItemIcon><SearchIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Buscar freezer" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* CLIENTES */}
        <ListItemButton onClick={() => handleToggle('clientes')}>
          <ListItemIcon><PeopleAltIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Clientes" />
          {openMenus.clientes ? <ExpandLess sx={{ color: iconColor }} /> : <ExpandMore sx={{ color: iconColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.clientes} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/clientes')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Listar clientes" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/clientes/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo cliente" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/clientes/buscar')}>
              <ListItemIcon><SearchIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Buscar cliente" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* MANTENIMIENTOS */}
        <ListItemButton onClick={() => handleToggle('mantenimientos')}>
          <ListItemIcon><AccessAlarmsIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Mantenimientos" />
          {openMenus.mantenimientos ? <ExpandLess sx={{ color: iconColor }} /> : <ExpandMore sx={{ color: iconColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.mantenimientos} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/mantenimientos')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Historial" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/mantenimientos/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Registrar nuevo" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* USUARIOS */}
        <ListItemButton onClick={() => handleToggle('usuarios')}>
          <ListItemIcon><AccountCircleIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Usuarios" />
          {openMenus.usuarios ? <ExpandLess sx={{ color: iconColor }} /> : <ExpandMore sx={{ color: iconColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.usuarios} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/usuarios')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Gestión de usuarios" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/usuarios/crear')}>
              <ListItemIcon><PersonAddIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Crear usuario" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* EVENTOS */}
        <ListItemButton onClick={() => handleToggle('eventos')}>
          <ListItemIcon><AssignmentTurnedInIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Eventos" />
          {openMenus.eventos ? <ExpandLess sx={{ color: iconColor }} /> : <ExpandMore sx={{ color: iconColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.eventos} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/eventos')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Todos los eventos" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/eventos/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo evento" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* ZONAS */}
        <ListItemButton onClick={() => handleToggle('zonas')}>
          <ListItemIcon><LocationPinIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Zonas" />
          {openMenus.zonas ? <ExpandLess sx={{ color: iconColor }} /> : <ExpandMore sx={{ color: iconColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.zonas} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/ubicaciones')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Departamentos" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/ubicaciones/crear')}>
              <ListItemIcon><AddIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo Departamento" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* AUDITORÍA */}
        <ListItemButton onClick={() => handleToggle('auditoria')}>
          <ListItemIcon><FactCheckIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Auditoría" />
          {openMenus.auditoria ? <ExpandLess sx={{ color: iconColor }} /> : <ExpandMore sx={{ color: iconColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.auditoria} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleMobileNavigation('/auditoria')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Ver registros" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#394867',
        zIndex: (theme),
        width: '100%',
        ml: 0
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label='open drawer'
            edge="start"
            onClick={isLargeScreen ? toggleSideNav : toggleMobileMenu}
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
            <Typography variant="body1">{nombreUsuario}</Typography>
            <Typography variant="caption" sx={{ color: '#ccc', textTransform: 'capitalize' }}>{rolUsuario}</Typography>
          </Box>
          <Avatar alt={nombreUsuario} sx={{ bgcolor: blue[500] }}>{nombreUsuario[0]}</Avatar>

        </Box>
      </Toolbar>
      
      {!isLargeScreen && (
        <Drawer
          variant="temporary"
          anchor="top" // Se abre desde arriba
          open={mobileMenuOpen} // Controlado por el estado mobileMenuOpen de DashboardLayout
          onClose={toggleMobileMenu} // Para cerrar al hacer clic fuera
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en móviles
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: '100%',
              backgroundColor: solidDrawerBgColor, 
              color: textColor,
            },
          }}
        >
          {drawerContent} 
        </Drawer>
      )} 
    </AppBar>
  );
}
