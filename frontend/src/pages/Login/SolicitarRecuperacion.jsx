import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
// Iconos y Estilos
import '../../styles/Login.css'; 
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Snackbar, 
  Alert 
} from '@mui/material';

import fondo from '../../assets/fondo-login-0.png';
import logo from '../../assets/logo-negro-2.png';

function SolicitarRecuperacion() {
  const [correo, setCorreo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Recuperar Contraseña';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSnackbarOpen(false); 

    try {

      const response = await axiosInstance.post('/auth/solicitar-recuperacion', { correo });
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } catch (error) {

      console.error('Error al solicitar recuperación:', error);
      setSnackbarMessage('Si el correo electrónico está registrado, se ha enviado un enlace para restablecer la contraseña.');
      setSnackbarSeverity('info'); // 'info' para no revelar si el correo existe
      setSnackbarOpen(true);

    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div className="login-container">
        <Paper elevation={0} className="login-box" sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          <img src={logo} alt="Logo" className="logo" />

          <Typography
            variant="h5"
            component="h2"
            align="center"
            gutterBottom
            className="login-box-h2"
            sx={{
              textTransform: 'uppercase',
            }}>
            Recuperar Contraseña
          </Typography>

          <Typography variant="body2" align="center" sx={{ mb: 2, color: '#555' }}>
            Introduce tu correo electrónico para buscar tu cuenta.
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextField
              label="Correo Electrónico"
              variant="outlined"
              fullWidth
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '& fieldset': {
                    borderColor: '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9bcbe0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5f85db',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-outlined': {
                  color: '#333',
                  fontWeight: 'bold',
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)',
                  },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                backgroundColor: '#9bcbe0',
                color: 'white',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '16px',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#72b3d2',
                  boxShadow: 'none',
                },
                transition: '0.3s ease',
                marginTop: '15px',
                '&.Mui-disabled': {
                  backgroundColor: '#b0d9ea',
                  color: '#e0e0e0',
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ENVIAR ENLACE'}
            </Button>
            <Link to="/" variant="body2" className="extra-options-link" sx={{ textAlign: 'center', marginTop: '10px', color: '#5f85db', pointerEvents: isLoading ? 'none' : 'auto' }}>
              Volver al Login
            </Link>
          </form>
        </Paper>

        <Typography
          variant="body2"
          align="center"
          sx={{
            marginTop: '25px',
            fontSize: '12px',
            color: '#f0f0f0',
            opacity: 0.8,
          }}
        >
          LogiRefrigeración para la empresa "Nombre de la Empresa"
        </Typography>
      </div>

      {/* Snackbar para mensajes al usuario */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default SolicitarRecuperacion;
