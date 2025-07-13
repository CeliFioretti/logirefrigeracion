import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/admin-dashboard'); 
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Página no encontrada
      </Typography>
      <Typography variant="body1" paragraph>
        Lo sentimos, la página que estás buscando no existe.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGoHome}>
        Ir al Dashboard
      </Button>
    </Container>
  );
}

export default NotFoundPage;