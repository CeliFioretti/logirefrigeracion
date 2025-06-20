import { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Grid, CircularProgress
} from '@mui/material';
import {
  Storefront, People, EventAvailable, EventBusy, Inventory2, Settings
} from '@mui/icons-material';
import axios from 'axios';

const resumenes = [
  { key: 'freezersPrestados', label: 'Freezers activos', icon: <Storefront />, color: '#e0f2f1' },
  { key: 'freezersDisponibles', label: 'Freezers inactivos', icon: <Inventory2 />, color: '#fff3e0' },
  { key: 'mantenimientosPendientes', label: 'Mantenimientos', icon: <Settings />, color: '#fce4ec' },
  { key: 'totalClientes', label: 'Total de clientes', icon: <People />, color: '#e8eaf6' },
  { key: 'retirosDelMes', label: 'Retiros realizados', icon: <EventBusy />, color: '#ffebee' },
  { key: 'entregasDelMes', label: 'Entregas realizadas', icon: <EventAvailable />, color: '#e8f5e9' },
];

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    document.title = 'Dashboard - Admin';

    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get('http://localhost:3200/api/dashboard', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        setDashboardData(data);
      } catch (err) {
        console.error('Error al obtener datos del dashboard:', err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>

      <Grid container spacing={2}>
        {!dashboardData ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          resumenes.map((item, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper
                sx={{
                  p: 5,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 3,
                  boxShadow: 3,
                  backgroundColor: item.color
                }}
              >
                <Box sx={{ mr: 2 }}>{item.icon}</Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#444' }}>{item.label}</Typography>
                  <Typography variant="h4">
                    {dashboardData[item.key] ?? 0}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* Últimos registros */}
      <Box mt={5}>
        <Typography variant="h6" gutterBottom>Últimos Freezers</Typography>
        {/* Aca va la tabla de registros recientes */}
      </Box>
    </Box>
  );
}
