import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
  Link
} from '@mui/material';

function Login() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Login';
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (location.pathname === '/login' && token && rol) {
      navigate('/dashboard', { replace: true });
      }
    }, [navigate, location]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:3200/api/auth/login', {
        nombre,
        password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);

      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url('/fondo-login-0.png')",
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
          <img src="/logo-negro-2.png" alt="Logo" className="logo" />

          <Typography
            variant="h5"
            component="h2"
            align="center"
            gutterBottom
            className="login-box-h2"
            sx={{
              textTransform: 'uppercase',
            }}>
            Iniciar Sesión
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextField
              label="Nombre de usuario "
              variant="outlined"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
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

            <TextField
              label="Contraseña "
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

            <Box className="extra-options" sx={{ width: '100%' }}>
              <FormControlLabel
                control={<Checkbox sx={{ '&.Mui-checked': { color: '#5f85db' } }} />}
                label={<Typography variant="body2" sx={{ fontSize: '13px', color: '#333' }}>Recuérdame</Typography>}
              />
              <Link href="#" variant="body2" className="extra-options-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
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
                marginTop: '15px'
              }}
            >
              ENTRAR
            </Button>
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
    </div>
  );
}

export default Login;
