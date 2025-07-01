// src/components/SideNav.jsx
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Toolbar } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Iconos
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

export default function SideNav({ open }) {
  const navigate = useNavigate();

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
  };

  const iconColor = '#14274E';
  const textColor = '#14274E';

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 240 : 0,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        overflowX: 'hidden',
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: open ? 240 : 0,
          boxSizing: 'border-box',
          backgroundColor: 'rgba(57, 72, 103, 0.53)',
          color: textColor,
          transition: 'width 0.3s',
        }
      }}
    >

      <Toolbar />
      <List>
        {/* INICIO */}
        <ListItemButton onClick={() => navigate('/dashboard')}>
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
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/freezers')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Listado" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/freezers/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo freezer" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/freezers/buscar')}>
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
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/clientes')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Listar clientes" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/clientes/nuevo')}>
              <ListItemIcon><AddIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Nuevo cliente" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/clientes/buscar')}>
              <ListItemIcon><SearchIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Buscar cliente" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* MANTENIMIENTOS */}
        <ListItemButton onClick={() => handleToggle('mantenimientos')}>
          <ListItemIcon><AccessAlarmsIcon sx={{ color: iconColor }} /></ListItemIcon>
          <ListItemText primary="Mantenimiento" />
          {openMenus.mantenimientos ? <ExpandLess sx={{ color: iconColor }} /> : <ExpandMore sx={{ color: iconColor }} />}
        </ListItemButton>
        <Collapse in={openMenus.mantenimientos} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/mantenimientos')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Historial" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/mantenimientos/nuevo')}>
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
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/usuarios')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Gestión de usuarios" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/usuarios')}>
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
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/eventos')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Todos los eventos" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/eventos/nuevo')}>
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
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/ubicaciones')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Departamentos" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/ubicaciones/crear')}>
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
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/auditoria')}>
              <ListItemIcon><ListAltIcon sx={{ color: iconColor }} /></ListItemIcon>
              <ListItemText primary="Ver registros" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}