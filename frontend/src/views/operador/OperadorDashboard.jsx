import { Box, Toolbar, Paper, Typography } from '@mui/material';
import TopBarOperador from '../../components/TopBarOperador';

export default function OperadorDashboard() {

  return (
    <Box>
      <TopBarOperador title="Panel Operador" />
      <Box component="main" sx={{ p: 3, mt: 8 }}>
        <Typography variant="h6" gutterBottom>Mis Eventos</Typography>
        <Paper sx={{ p: 2 }}>
          {/* Aquí tu componente Table con datos de /mis-eventos */}
          <Typography> [Tabla de eventos aquí] </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
