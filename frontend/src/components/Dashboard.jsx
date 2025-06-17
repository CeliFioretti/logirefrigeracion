import { useNavigate } from 'react-router-dom'; 
import { useEffect } from 'react';
import AdminDashboard from '../pages/AdminDashboard'; 
import OperatorDashboard from '../pages/OperadorDashboard'; 

import { Box, Typography } from '@mui/material';

function Dashboard() {
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol');

  useEffect(() => {

    if (!rol) {
      navigate('/', { replace: true });
      return;
    }

    // Configura el título de la pestaña según el rol
    if (rol === 'administrador') {
      document.title = 'Dashboard Admin - LogiRefrigeración';
    } else if (rol === 'operador') {
      document.title = 'Dashboard Operador - LogiRefrigeración';
    } else {
      document.title = 'Dashboard - LogiRefrigeración'; // Título por defecto
    }
  }, [rol, navigate]); 

  // Renderiza el componente de dashboard adecuado según el rol
  const renderDashboardContent = () => {
    switch (rol) {
      case 'administrador':
        return <AdminDashboard />;
      case 'operador':
        return <OperatorDashboard />;
      default:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Typography variant="h5" color="error">Rol no reconocido o acceso denegado.</Typography>
          </Box>
        );
    }
  };

  return (
    <Box>
      {renderDashboardContent()}
    </Box>
  );
}

export default Dashboard;