import { useNavigate , useLocation } from 'react-router-dom';
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
  Collapse,
  Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { blue } from '@mui/material/colors';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

// Iconos para el menú (se usan en el drawer móvil)
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AppsIcon from '@mui/icons-material/Apps';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn'; 
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; 
import PersonIcon from '@mui/icons-material/Person'; 

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
    usuarios: false,
    gestionUsuarios: false,
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

  // Colores para el drawer
  const primaryColor = '#1a237e'; 
  const secondaryColor = '#3f51b5'; 
  const lightGrey = '#f0f2f5';
  const darkGrey = '#cfd8dc'; 
  const activeBgColor = '#e3f2fd'; 
  const activeTextColor = primaryColor; 
  const activeIconColor = primaryColor; 

  // Función para determinar si un elemento está activo
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
            {/* GESTIÓN DE USUARIOS (sub-menú) */}
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
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/usuarios/codigos-registro')} selected={isActive('/usuarios/codigos-registro')}>
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
          open={mobileMenuOpen} 
          onClose={toggleMobileMenu} // Para cerrar al hacer clic fuera
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en móviles
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
