// src/layout/DashboardLayout.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

import SideNav from '../components/SideNav';
import TopBarAdmin from '../components/TopBarAdmin';

import AdminDashboard from '../views/admin/AdminDashboard';
import OperatorDashboard from '../views/operador/OperadorDashboard';


function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const { usuario } = useContext(UserContext);
  const rol = usuario ? usuario.rol : null; // Accede al rol a través del objeto usuario

  const toggleDrawer = () => {
    setOpen(prev => !prev);
  };

  // Si no hay un usuario, el sistema redirige al login
  useEffect(() => {
    if (!usuario) {
      navigate('/', { replace: true });
    }
  }, [usuario, navigate]);

  // Condiciona el titulo de la pagina segun el rol
  useEffect(() => {
    if (usuario?.rol === 'administrador') {
      document.title = 'Dashboard Admin - LogiRefrigeración';
    } else if (usuario?.rol === 'operador') {
      document.title = 'Dashboard Operador - LogiRefrigeración';
    } else {
      document.title = 'Dashboard - LogiRefrigeración';
    }
  }, [usuario?.rol]);

  
  const renderContent = () => {
    // Muestra un mensaje de carga o de rol no reconocido si usuario o rol no están definidos
    if (!usuario || !rol) {
      return <p style={{ padding: 24 }}>Cargando o Rol no disponible...</p>;
    }

    if (rol === 'administrador') return <AdminDashboard />;
    if (rol === 'operador') return <OperatorDashboard />;
    return <p style={{ padding: 24 }}>Rol no reconocido</p>;
  };

  // Si no hay usuario no se renderiza para evitar flashes
  if (!usuario) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <TopBarAdmin toggleDrawer={toggleDrawer} />
      <SideNav open={open} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          marginLeft: open ? 0 : 0,
          transition: 'margin 0.3s',
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}

export default DashboardLayout;