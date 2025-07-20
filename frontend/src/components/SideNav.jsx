import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Toolbar } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Iconos
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import { Typography, Divider } from '@mui/material';

const AdminIcon = SupervisorAccountIcon;
const OperadorIcon = PersonIcon;

export default function SideNav({ open, toggleDrawer, drawerWidth }) {
  const navigate = useNavigate();

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
  };

  // Colores para el Sidenav
  const primaryColor = '#1a237e';
  const darkGrey = '#cfd8dc';
  const activeBgColor = '#e3f2fd';
  const activeTextColor = primaryColor;
  const activeIconColor = primaryColor;
  const iconColor = '#14274E';
  const textColor = '#14274E';
  const solidSideNavBgColor = '#e1e7ee';

  // Función para navegar y cerrar el SideNav 
  const handleNavigation = (path) => {
    navigate(path);
    toggleDrawer(); // Cierra el SideNav al hacer click en un elemento
  }

  // Función para determinar si un elemento está activo
  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  return (
    <Drawer
      variant="temporary"
      anchor='left'
      open={open}
      onClose={toggleDrawer}
      ModalProps={{
        keepMounted: true
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        overflowX: 'hidden',
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: solidSideNavBgColor,
          color: textColor,
        }
      }}
    >

      <Toolbar>
        {/* Espacio para logo o titulo */}
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: primaryColor }}>
          Panel de Administrador
        </Typography>
      </Toolbar>

      <List sx={{
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
      }}>
        {/* INICIO */}
        <ListItemButton onClick={() => handleNavigation('/admin-dashboard')} selected={isActive('/admin-dashboard')}>
          <ListItemIcon><AppsIcon sx={{ color: isActive('/admin-dashboard') ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Inicio" sx={{ fontWeight: isActive('/admin-dashboard') ? 'bold' : 'normal', color: isActive('/admin-dashboard') ? activeTextColor : primaryColor }} />
        </ListItemButton>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* FREEZERS */}
        <ListItemButton onClick={() => handleToggle('freezers')} selected={isParentActive(['/freezers/listado', '/freezers/nuevo'])}>
          <ListItemIcon><AcUnitIcon sx={{ color: isParentActive(['/freezers/listado', '/freezers/nuevo', '/freezers/editar']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Freezers" sx={{ fontWeight: isParentActive(['/freezers/listado', '/freezers/nuevo', '/freezers/editar']) ? 'bold' : 'normal', color: isParentActive(['/freezers', '/freezers/nuevo', '/freezers/editar']) ? activeTextColor : primaryColor }} />
          {openMenus.freezers ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.freezers || isParentActive(['/freezers/listado', '/freezers/nuevo', '/freezers/editar'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/freezers/listado')} selected={isActive('/freezers/listado')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/freezers/listado') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Listado" sx={{ fontWeight: isActive('/freezers/listado') ? 'bold' : 'normal', color: isActive('/freezers/listado') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/freezers/nuevo')} selected={isActive('/freezers/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/freezers/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo freezer" sx={{ fontWeight: isActive('/freezers/nuevo') ? 'bold' : 'normal', color: isActive('/freezers/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* CLIENTES */}
        <ListItemButton
          onClick={() => handleToggle('clientes')}
          selected={isParentActive(['/clientes', '/clientes/nuevo', '/clientes/editar'])}
        >
          <ListItemIcon><PeopleAltIcon sx={{ color: isParentActive(['/clientes', '/clientes/nuevo', '/clientes/editar']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Clientes" sx={{ fontWeight: isParentActive(['/clientes', '/clientes/nuevo', '/clientes/editar']) ? 'bold' : 'normal', color: isParentActive(['/clientes', '/clientes/nuevo', '/clientes/editar']) ? activeTextColor : primaryColor }} />
          {openMenus.clientes ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.clientes || isParentActive(['/clientes', '/clientes/nuevo', '/clientes/editar'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/clientes')} selected={isActive('/clientes')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/clientes') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Listar clientes" sx={{ fontWeight: isActive('/clientes') ? 'bold' : 'normal', color: isActive('/clientes') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/clientes/nuevo')} selected={isActive('/clientes/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/clientes/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo cliente" sx={{ fontWeight: isActive('/clientes/nuevo') ? 'bold' : 'normal', color: isActive('/clientes/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* MANTENIMIENTOS */}
        <ListItemButton
          onClick={() => handleToggle('mantenimientos')}
          selected={isParentActive(['/mantenimientos', '/mantenimientos/nuevo', '/mantenimientos/editar'])}
        >
          <ListItemIcon><AccessAlarmsIcon sx={{ color: isParentActive(['/mantenimientos', '/mantenimientos/nuevo', '/mantenimientos/editar']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Mantenimiento" sx={{ fontWeight: isParentActive(['/mantenimientos', '/mantenimientos/nuevo', '/mantenimientos/editar']) ? 'bold' : 'normal', color: isParentActive(['/mantenimientos', '/mantenimientos/nuevo', '/mantenimientos/editar']) ? activeTextColor : primaryColor }} />
          {openMenus.mantenimientos ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.mantenimientos || isParentActive(['/mantenimientos', '/mantenimientos/nuevo', '/mantenimientos/editar'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/mantenimientos')} selected={isActive('/mantenimientos')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/mantenimientos') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Historial" sx={{ fontWeight: isActive('/mantenimientos') ? 'bold' : 'normal', color: isActive('/mantenimientos') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/mantenimientos/nuevo')} selected={isActive('/mantenimientos/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/mantenimientos/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Registrar nuevo" sx={{ fontWeight: isActive('/mantenimientos/nuevo') ? 'bold' : 'normal', color: isActive('/mantenimientos/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* USUARIOS */}
        <ListItemButton
          onClick={() => handleToggle('usuarios')}
          selected={isParentActive(['/usuarios', '/usuarios/administradores', '/usuarios/operadores', '/usuarios/crear'])}
        >
          <ListItemIcon><AccountCircleIcon sx={{ color: isParentActive(['/usuarios', '/usuarios/administradores', '/usuarios/operadores', '/usuarios/crear']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Usuarios" sx={{ fontWeight: isParentActive(['/usuarios', '/usuarios/administradores', '/usuarios/operadores', '/usuarios/crear']) ? 'bold' : 'normal', color: isParentActive(['/usuarios', '/usuarios/administradores', '/usuarios/operadores', '/usuarios/crear']) ? activeTextColor : primaryColor }} />
          {openMenus.usuarios ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.usuarios || isParentActive(['/usuarios', '/usuarios/administradores', '/usuarios/operadores', '/usuarios/crear'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            {/* GESTIÓN DE USUARIOS */}
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => handleToggle('gestionUsuarios')}
              selected={isParentActive(['/usuarios/administradores', '/usuarios/operadores'])}
            >
              <ListItemIcon><ListAltIcon sx={{ color: isParentActive(['/usuarios/administradores', '/usuarios/operadores']) ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Gestión de usuarios" sx={{ fontWeight: isParentActive(['/usuarios/administradores', '/usuarios/operadores']) ? 'bold' : 'normal', color: isParentActive(['/usuarios/administradores', '/usuarios/operadores']) ? activeTextColor : primaryColor }} />
              {openMenus.gestionUsuarios ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
            </ListItemButton>

            <Collapse in={openMenus.gestionUsuarios || isParentActive(['/usuarios/administradores', '/usuarios/operadores'])} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* ADMINISTRADORES */}
                <ListItemButton sx={{ pl: 6 }} onClick={() => handleNavigation('/usuarios/administradores')} selected={isActive('/usuarios/administradores')}>
                  <ListItemIcon><AdminIcon sx={{ color: isActive('/usuarios/administradores') ? activeIconColor : primaryColor }} /></ListItemIcon>
                  <ListItemText primary="Administradores" sx={{ fontWeight: isActive('/usuarios/administradores') ? 'bold' : 'normal', color: isActive('/usuarios/administradores') ? activeTextColor : primaryColor }} />
                </ListItemButton>

                {/* OPERADORES */}
                <ListItemButton sx={{ pl: 6 }} onClick={() => handleNavigation('/usuarios/operadores')} selected={isActive('/usuarios/operadores')}>
                  <ListItemIcon><OperadorIcon sx={{ color: isActive('/usuarios/operadores') ? activeIconColor : primaryColor }} /></ListItemIcon>
                  <ListItemText primary="Operadores" sx={{ fontWeight: isActive('/usuarios/operadores') ? 'bold' : 'normal', color: isActive('/usuarios/operadores') ? activeTextColor : primaryColor }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* CREAR USUARIO */}
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/usuarios/crear')} selected={isActive('/usuarios/crear')}>
              <ListItemIcon><PersonAddIcon sx={{ color: isActive('/usuarios/crear') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Crear usuario" sx={{ fontWeight: isActive('/usuarios/crear') ? 'bold' : 'normal', color: isActive('/usuarios/crear') ? activeTextColor : primaryColor }} />
            </ListItemButton>

          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* EVENTOS */}
        <ListItemButton
          onClick={() => handleToggle('eventos')}
          selected={isParentActive(['/eventos', '/eventos/nuevo'])}
        >
          <ListItemIcon><AssignmentTurnedInIcon sx={{ color: isParentActive(['/eventos', '/eventos/nuevo']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Eventos" sx={{ fontWeight: isParentActive(['/eventos', '/eventos/nuevo']) ? 'bold' : 'normal', color: isParentActive(['/eventos', '/eventos/nuevo']) ? activeTextColor : primaryColor }} />
          {openMenus.eventos ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.eventos || isParentActive(['/eventos', '/eventos/nuevo'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/eventos')} selected={isActive('/eventos')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/eventos') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Todos los eventos" sx={{ fontWeight: isActive('/eventos') ? 'bold' : 'normal', color: isActive('/eventos') ? activeTextColor : primaryColor }} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/eventos/nuevo')} selected={isActive('/eventos/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: isActive('/eventos/nuevo') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo evento" sx={{ fontWeight: isActive('/eventos/nuevo') ? 'bold' : 'normal', color: isActive('/eventos/nuevo') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* ZONAS */}
        <ListItemButton
          onClick={() => handleToggle('zonas')}
          selected={isParentActive(['/ubicaciones'])}
        >
          <ListItemIcon><LocationOnIcon sx={{ color: isParentActive(['/ubicaciones']) ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Zonas" sx={{ fontWeight: isParentActive(['/ubicaciones']) ? 'bold' : 'normal', color: isParentActive(['/ubicaciones']) ? activeTextColor : primaryColor }} />
          {openMenus.zonas ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.zonas || isParentActive(['/ubicaciones'])} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/ubicaciones')} selected={isActive('/ubicaciones')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/ubicaciones') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Departamentos" sx={{ fontWeight: isActive('/ubicaciones') ? 'bold' : 'normal', color: isActive('/ubicaciones') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: darkGrey }} />

        {/* AUDITORÍA */}
        <ListItemButton
          onClick={() => handleToggle('auditoria')}
          selected={isActive('/auditoria')}
        >
          <ListItemIcon><FactCheckIcon sx={{ color: isActive('/auditoria') ? activeIconColor : primaryColor }} /></ListItemIcon>
          <ListItemText primary="Auditoría" sx={{ fontWeight: isActive('/auditoria') ? 'bold' : 'normal', color: isActive('/auditoria') ? activeTextColor : primaryColor }} />
          {openMenus.auditoria ? <ExpandLess sx={{ color: primaryColor }} /> : <ExpandMore sx={{ color: primaryColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.auditoria || isActive('/auditoria')} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigation('/auditoria')} selected={isActive('/auditoria')}>
              <ListItemIcon><ListAltIcon sx={{ color: isActive('/auditoria') ? activeIconColor : primaryColor }} /></ListItemIcon>
              <ListItemText primary="Ver registros" sx={{ fontWeight: isActive('/auditoria') ? 'bold' : 'normal', color: isActive('/auditoria') ? activeTextColor : primaryColor }} />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}