import React, { useContext } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext'; 

function SessionExpiredPage() {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext); 

  const handleLoginAgain = () => {
    logout(); 
    navigate('/'); 
  };

  return (
    <Container maxWidth="sm" sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh', 
      textAlign: 'center',
      p: 3 
    }}>
      <Typography variant="h2" component="h1" gutterBottom color="error">
        ¡Sesión Expirada!
      </Typography>
      <Typography variant="body1" paragraph>
        Tu sesión ha caducado por inactividad o por seguridad.
        Por favor, inicia sesión nuevamente para continuar.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLoginAgain}
        sx={{ mt: 3, px: 5, py: 1.5 }} 
      >
        Iniciar Sesión Nuevamente
      </Button>
    </Container>
  );
}

export default SessionExpiredPage;