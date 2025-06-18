import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import SideNav from '../components/SideNav';
import TopBarAdmin from '../components/TopBarAdmin';

// estos dashboard contienen tambien el sidenav y el topbaradmin, hay que cambiar
import AdminDashboard from '../views/admin/AdminDashboard';
import OperatorDashboard from '../views/operador/OperadorDashboard';

function DashboardLayout() {
  const navigate = useNavigate();
  const rol = sessionStorage.getItem('rol');

  useEffect(() => {
    if (!rol) {
      navigate('/', { replace: true });
    }
    // Setea título según rol
    if (rol === 'administrador') {
      document.title = 'Dashboard Admin - LogiRefrigeración';
    } else if (rol === 'operador') {
      document.title = 'Dashboard Operador - LogiRefrigeración';
    }
  }, [rol, navigate]);

  const renderContent = () => {
    if (rol === 'administrador') return <AdminDashboard />;
    if (rol === 'operador') return <OperatorDashboard />;
    return (
      <Box p={3}>
        <Typography color="error">Rol no reconocido</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav />
      <Box sx={{ flexGrow: 1 }}>
        <TopBarAdmin />
        <Box sx={{ p: 3 }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
