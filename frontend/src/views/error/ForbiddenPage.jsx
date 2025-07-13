import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ForbiddenPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Intenta ir a la página anterior
  };

  const handleGoHome = () => {
    navigate('/admin-dashboard');
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        403
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Acceso Denegado
      </Typography>
      <Typography variant="body1" paragraph>
        No tienes permiso para acceder a esta página.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" sx={{ mr: 2 }} onClick={handleGoBack}>
          Volver
        </Button>
        <Button variant="contained" color="primary" onClick={handleGoHome}>
          Ir al Dashboard
        </Button>
      </Box>
    </Container>
  );
}

export default ForbiddenPage;