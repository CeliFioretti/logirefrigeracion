import { useEffect } from 'react';
import { Box, Toolbar, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import TopBarAdmin from '../../components/TopBarAdmin';


export default function AdminDashboard() {

  useEffect(() => {
    document.title = 'Dashboard - Admin';
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <TopBarAdmin title="Panel Administrador" />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* Tarjetas resumen */}
        <Grid container spacing={2}>
          {/* Ejemplo tarjeta */}
          <Grid size={{xs:12, sm:6, md:3}}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Freezers activos</Typography>
              <Typography variant="h4">123</Typography>
            </Paper>
          </Grid>
          {/* Repetí para otras métricas */}
        </Grid>

        {/* Tabla “Últimos registros” */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Últimos Freezers</Typography>
          {/* Aquí irá tu componente Table personalizado */}
        </Box>
      </Box>
    </Box>
  );
}
