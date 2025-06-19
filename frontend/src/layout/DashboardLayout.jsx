import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';

import SideNav from '../components/SideNav';
import TopBarAdmin from '../components/TopBarAdmin';

import AdminDashboard from '../views/admin/AdminDashboard';
import OperatorDashboard from '../views/operador/OperadorDashboard';

const drawerWidth = 240;

function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const rol = sessionStorage.getItem('rol');

  const toggleDrawer = () => {
    setOpen(prev => !prev);
  };

  useEffect(() => {
    if (!rol) {
      navigate('/', { replace: true });
    }

    if (rol === 'administrador') {
      document.title = 'Dashboard Admin - LogiRefrigeración';
    } else if (rol === 'operador') {
      document.title = 'Dashboard Operador - LogiRefrigeración';
    }
  }, [rol, navigate]);

  const renderContent = () => {
    if (rol === 'administrador') return <AdminDashboard />;
    if (rol === 'operador') return <OperatorDashboard />;
    return <p style={{ padding: 24 }}>Rol no reconocido</p>;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <TopBarAdmin toggleDrawer={toggleDrawer} />
      <SideNav open={open} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: 'margin 0.3s',
        }}
      >
        <Toolbar /> {/* espacio para que el topbar no tape */}
        {renderContent()}
      </Box>
    </Box>
  );
}

export default DashboardLayout;
