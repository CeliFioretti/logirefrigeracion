import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Storefront, People, EventAvailable, EventBusy, Inventory2, Settings
} from '@mui/icons-material';
import axios from 'axios';

const fondoCard = '#FFFFFF';

const resumenes = [
  { key: 'freezersPrestados', label: 'Freezers activos', icon: <Storefront sx={{ color: '#f5b041', fontSize: 40 }} />, color: fondoCard },
  { key: 'freezersDisponibles', label: 'Freezers inactivos', icon: <Inventory2 sx={{ color: '#81E5B3', fontSize: 40 }} />, color: fondoCard },
  { key: 'mantenimientosPendientes', label: 'Mantenimientos', icon: <Settings sx={{ color: '#f99d7b', fontSize: 40 }} />, color: fondoCard },
  { key: 'totalClientes', label: 'Total de clientes', icon: <People sx={{ color: '#7bc2f9', fontSize: 40 }} />, color: fondoCard },
  { key: 'retirosDelMes', label: 'Retiros realizados', icon: <EventBusy sx={{ color: '#c27bf9', fontSize: 40 }} />, color: fondoCard },
  { key: 'entregasDelMes', label: 'Entregas realizadas', icon: <EventAvailable sx={{ color: '#e4e213', fontSize: 40 }} />, color: fondoCard },
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
      <Container maxWidth={false} sx={{ mb: 4, maxWidth: '1200px' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Dashboard
        </Typography>

        <Grid container spacing={5}>
          {!dashboardData ? (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" >
                <CircularProgress />
              </Box>
            </Grid>
          ) : (
            resumenes.map((item, index) => (
              <Grid  item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    minWidth: '300px',
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: item.color,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Título e Icono arriba */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Typography variant="subtitle1" sx={{ color: '#444' }}>
                      {item.label}
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'rgba(231, 229, 229, 0.2)', // fondo suave del icono
                        borderRadius: '50%',
                        p: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Box>

                  {/* Número grande */}
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '2.4rem',
                        color: '#222'
                      }}
                    >
                      {dashboardData[item.key] ?? 0}
                    </Typography>
                  </Box>

                  {/* Porcentaje de crecimiento */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="span"
                      sx={{
                        fontSize: '1.2rem',
                        color: '#26a69a',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      📈 {/* Podés reemplazar por un icono de MUI tipo <TrendingUp fontSize="small" /> */}
                      +1.3%
                    </Box>
                    <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                      Más que en Marzo
                    </Typography>
                  </Box>
                </Paper>

              </Grid>
            ))
          )}
        </Grid>

        {/* Últimos registros */}
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>
            Últimos Freezers
          </Typography>
          {/* Aquí tu tabla o componente */}
        </Box>
      </Container>
  );
}




