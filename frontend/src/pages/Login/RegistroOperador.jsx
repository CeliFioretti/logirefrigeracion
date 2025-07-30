import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import {
  TextField,
  Button,
  Typography,
  Paper
} from '@mui/material';

import '../../styles/Login.css'; 
import fondo from '../../assets/fondo-login-0.png';
import logo from '../../assets/logo-negro-2.png';

function RegistroOperador() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [codigoRegistro, setCodigoRegistro] = useState('');
  const [error, setError] = useState(''); // Estado para manejar errores del backend
  const [success, setSuccess] = useState(''); // Estado para manejar mensajes de éxito

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Registro de Operador';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');

    // Validaciones básicas del lado del cliente
    if (!nombre || !correo || !password || !codigoRegistro) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!/[a-zA-Z]/.test(password)) {
      setError('La contraseña debe contener al menos una letra.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('La contraseña debe contener al menos un número.');
      return;
    }

    try {
      const { data } = await axiosInstance.post('/auth/registro', {
        nombre,
        correo,
        password,
        codigoRegistro,
      });

      setSuccess(data.message || 'Registro exitoso. Ahora puedes iniciar sesión.');
      setNombre('');
      setCorreo('');
      setPassword('');
      setCodigoRegistro('');

      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        navigate('/'); // Redirige a la página de login
      }, 3000);

    } catch (err) {
      console.error('Error durante el registro:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Error al registrar usuario.');
    }
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
            Registro de Operador
          </Typography>

          {error && (
            <Typography color="error" variant="body2" align="center" sx={{ width: '100%' }}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="primary" variant="body2" align="center" sx={{ width: '100%', color: 'green' }}>
              {success}
            </Typography>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextField
              label="Nombre de usuario"
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
              label="Correo Electrónico"
              variant="outlined"
              fullWidth
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              type="email"
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
              label="Contraseña"
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
            {/* Mensaje de requisitos de contraseña */}
            <Typography variant="body2" sx={{ fontSize: '12px', color: '#555', marginTop: '-10px' }}>
                Requisitos para contraseña: Mínimo 8 caracteres, al menos una letra (a-z o A-Z), al menos un número (0-9).
            </Typography>

            <TextField
              label="Código de Registro"
              variant="outlined"
              fullWidth
              value={codigoRegistro}
              onChange={(e) => setCodigoRegistro(e.target.value)}
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
              Registrarse
            </Button>
            <Link to="/" className="extra-options-link" variant="body2" sx={{ textAlign: 'center', marginTop: '10px', color: '#5f85db' }}>
                ¿Ya tienes una cuenta? Iniciar Sesión
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
    </div>
  );
}

export default RegistroOperador;