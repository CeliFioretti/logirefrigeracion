import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer
} from '@mui/material';
import {
  Storefront, People, EventAvailable, EventBusy, Inventory2, Settings, TrendingUp
} from '@mui/icons-material';
import axiosInstance from '../../api/axios'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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

  const fetchDashboard = useCallback(async () => {
    try {
      const {data} = await axiosInstance.get('/dashboard')
      setDashboardData(data);

    } catch (err) {
      console.error('Error al obtener datos del dashboard:', err)
    }
  }, [])

  useEffect(() => {
    document.title = 'Dashboard - Admin';
    fetchDashboard();
  }, [fetchDashboard])

  // Función para preparar los datos del gráfico
  const getChartData = () => {
    if (!dashboardData || !dashboardData.entregasDiarias || !dashboardData.retirosDiarios) {
      return [];
    }

    // Asegurarse de que ambos arrays tienen la misma longitud y corresponden a los mismos días
    const mergedData = dashboardData.entregasDiarias.map((entrega, index) => ({
      dia: new Date(entrega.dia).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      Entregas: entrega.total,
      Retiros: dashboardData.retirosDiarios[index]?.total || 0,
    }));
    return mergedData;
  };

  const chartData = getChartData();

  return (
    <Container maxWidth={false} sx={{ mb: 4, maxWidth: '1200px' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Dashboard
      </Typography>

      <Grid container spacing={5} justifyContent="center">
        {!dashboardData ? (
          <Grid>
            <Box display="flex" justifyContent="center" >
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          resumenes.map((item, index) => (
            <Grid key={index}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Paper
                sx={{
                  p: 2,
                  minWidth: '300px',
                  borderRadius: 3,
                  boxShadow: 3,
                  backgroundColor: item.color,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Título e Icono arriba */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}>

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
                    <TrendingUp fontSize='small' />
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

      {/* Gráfico de Retiros y Entregas del mes */}
      <Box mt={5}>
        <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Retiros y Entregas del mes
          </Typography>
          {dashboardData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Entregas" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Retiros" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <Typography variant="body1" color="text.secondary">Cargando datos del gráfico...</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Últimos registros de Freezers */}
      <Box mt={5}>
        <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Últimos Freezers Registrados
          </Typography>
          {dashboardData && dashboardData.ultimosFreezers && dashboardData.ultimosFreezers.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Modelo</TableCell>
                    <TableCell>Número de Serie</TableCell>
                    <TableCell>Capacidad</TableCell>
                    <TableCell>Marca</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha de Registro</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.ultimosFreezers.map((freezer) => (
                    <TableRow key={freezer.id}>
                      <TableCell>{freezer.modelo}</TableCell>
                      <TableCell>{freezer.numero_serie}</TableCell>
                      <TableCell>{freezer.capacidad}</TableCell>
                      <TableCell>{freezer.marca}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor:
                              freezer.estado === 'Disponible'
                                ? '#e8f5e9'
                                : freezer.estado === 'Asignado'
                                  ? '#e3f2fd'
                                  : '#ffebee',
                            color:
                              freezer.estado === 'Disponible'
                                ? '#388e3c' 
                                : freezer.estado === 'Asignado'
                                  ? '#1e88e5'
                                  : '#d32f2f',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                          }}
                        >
                          {freezer.estado}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(freezer.fecha_creacion).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={100}>
              <Typography variant="body1" color="text.secondary">No hay freezers registrados recientemente.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}




