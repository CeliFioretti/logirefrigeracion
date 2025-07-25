import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from '../../api/axios';

import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Pagination,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Material-UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KitchenIcon from '@mui/icons-material/Kitchen';
import BuildIcon from '@mui/icons-material/Build';
import AcUnitIcon from '@mui/icons-material/AcUnit';

function MantenimientosPendientes() {
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  useEffect(() => {
    document.title = 'Mantenimientos Pendientes';
    if (!usuario || usuario.rol !== 'operador') {
      navigate('/', { replace: true });
      return;
    }
    fetchMantenimientosPendientes();
  }, [usuario, navigate, page, searchQuery]); // Dependencias para recargar datos al cambiar página o búsqueda

  const fetchMantenimientosPendientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/asignaciones-mantenimiento/pendientes-operador', {
        headers: {
          Authorization: `Bearer ${usuario.token}`,
        },
        params: {
          page: page - 1, // El backend espera un índice de página basado en 0
          pageSize: pageSize,
          search: searchQuery,
        },
      });
      setMantenimientos(response.data.data);
      setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (err) {
      console.error('Error al obtener mantenimientos pendientes:', err);
      if (err.response && err.response.status === 403) {
        setError('No tienes permiso para ver esta información.');
      } else {
        setError('Error al cargar los mantenimientos pendientes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter' || event.type === 'click') {
      setPage(1); // Reinicia la página a 1 cuando se realiza una nueva búsqueda
      fetchMantenimientosPendientes();
    }
  };

  const handleGoBack = () => {
    navigate('/operador-menu');
  };

  const handleRegistrarMantenimiento = () => {
    // Navegar a la pantalla de registro de mantenimiento del operador
    navigate('/operador/registrar-mantenimiento');
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return ''; // Maneja casos donde la cadena es null, undefined o vacía
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Estilo para las tarjetas de mantenimiento
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: theme.spacing(2),
    boxShadow: theme.shadows[1],
    marginBottom: theme.spacing(2),
  };

  const infoTextStyle = {
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: theme.spacing(0.5),
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isSmallScreen ? theme.spacing(2) : theme.spacing(4),
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing(3),
        }}
      >
        <IconButton onClick={handleGoBack} sx={{ color: '#333' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            flexGrow: 1,
            textAlign: 'center',
            marginRight: isSmallScreen ? theme.spacing(5) : theme.spacing(7),
          }}
        >
          MANTENIMIENTOS PENDIENTES
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={1}
        sx={{
          width: '100%',
          maxWidth: '800px',
          padding: theme.spacing(1, 2),
          borderRadius: '25px',
          marginBottom: theme.spacing(3),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSearchSubmit(e);
          }}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.grey[500] }} />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiInputBase-input': { padding: '10px 0' } }}
        />
      </Paper>

      {/* Contenido principal */}
      <Box sx={{ width: '100%', maxWidth: '800px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : mantenimientos.length === 0 ? (
          <Alert severity="info">No se encontraron mantenimientos pendientes.</Alert>
        ) : (
          <>
            {mantenimientos.map((mantenimiento) => (
              <Paper key={mantenimiento.asignacion_id} sx={cardStyle}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 1 }}>
                  {mantenimiento.nombre_cliente}
                </Typography>
                <Typography sx={infoTextStyle}>
                  <AcUnitIcon fontSize="small" /> <span style={{ fontWeight: 'bold' }}>Freezer:</span> {mantenimiento.numero_serie} - {mantenimiento.modelo}
                </Typography>
                {mantenimiento.tipo_mantenimiento && (
                  <Typography sx={infoTextStyle}>
                   <KitchenIcon fontSize="small"/> <span style={{ fontWeight: 'bold' }}>Tipo de Freezer:</span> {capitalizeFirstLetter(mantenimiento.tipo_freezer)}
                  </Typography>
                )}
                {mantenimiento.tipo_mantenimiento && (
                  <Typography sx={infoTextStyle}>
                    <BuildIcon fontSize="small"/> <span style={{ fontWeight: 'bold' }}>Tipo de Mantenimiento: </span> {capitalizeFirstLetter(mantenimiento.tipo_mantenimiento)}
                  </Typography>
                )}
                <Typography sx={infoTextStyle}>
                  <LocationOnIcon fontSize="small" /> <span style={{ fontWeight: 'bold' }}> Dirección: </span> {mantenimiento.cliente_direccion}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary, mt: 1 }}>
                  Fecha: <span style={{ fontWeight: 'bold' }}>{new Date(mantenimiento.fecha_asignacion).toLocaleDateString()}</span>
                  {' '}
                  Hora:  <span style={{ fontWeight: 'bold' }}>{new Date(mantenimiento.fecha_asignacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </Typography>
                {mantenimiento.asignacion_observaciones && (
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', mt: 1 }}>
                    Obs: {mantenimiento.asignacion_observaciones}
                  </Typography>
                )}
              </Paper>
            ))}


            <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isSmallScreen ? 'small' : 'medium'}
              />
            </Stack>
          </>
        )}

        {/* Botón para Registrar Mantenimiento */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleRegistrarMantenimiento}
            sx={{
              padding: theme.spacing(1.5, 3),
              borderRadius: '25px',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Registrar mantenimiento
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default MantenimientosPendientes;