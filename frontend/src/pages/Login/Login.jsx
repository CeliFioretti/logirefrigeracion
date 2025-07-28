import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

// Iconos y Estilos
import '../../styles/Login.css';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress 
} from '@mui/material';

import fondo from '../../assets/fondo-login-0.png';
import logo from '../../assets/logo-negro-2.png';

function Login() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const { login: userContextLogin } = useContext(UserContext);
  const { usuario } = useContext(UserContext);

  const navigate = useNavigate();

  // Nombre de la página
  useEffect(() => {
    document.title = 'Login';
  }, []);


  useEffect(() => {
    if (usuario && usuario.token) {
      if (usuario.rol === 'administrador') {
        navigate('/admin-dashboard', { replace: true });
      } else if (usuario.rol === 'operador') {
        navigate('/operador-menu', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [usuario, navigate]);


  // Manejo del formulario Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Activa el spin de carga al inicio del intento de login
    try {
      const { data } = await axiosInstance.post('/auth/login', {
        nombre,
        password
      });

      userContextLogin({
        token: data.token,
        nombre: data.nombreUsuario,
        rol: data.rol
      })

      // Redirigir según el rol después de un login exitoso
      if (data.rol === 'administrador') {
        navigate('/admin-dashboard', { replace: true });
      } else if (data.rol === 'operador') {
        navigate('/operador-menu', { replace: true });
      } else {
        // Rol no reconocido después del login, redirigir a un default
        navigate('/admin-dashboard', { replace: true });
      }
    } catch (error) {
      alert('Credenciales incorrectas');
    } finally {
      setIsLoading(false); // Desactiva el spin de carga al finalizar (éxito o error)
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
              disabled={isLoading} // Deshabilita el campo mientras carga
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
              disabled={isLoading} // Deshabilita el campo mientras carga
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
                disabled={isLoading} // Deshabilita el checkbox mientras carga
              />
              <Link href="#" variant="body2" className="extra-options-link" sx={{pointerEvents: isLoading ? 'none' : 'auto'}}> {/* Deshabilita el link */}
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ENTRAR'}
            </Button>
            <Link href="/registro-operador" variant="body2" sx={{ textAlign: 'center', marginTop: '10px', color: '#5f85db', pointerEvents: isLoading ? 'none' : 'auto' }}> {/* Deshabilita el link */}
              ¿Eres operador? Regístrate aquí
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

export default Login;