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
  CircularProgress,
  Alert,
  Stack,
  Pagination,
  Chip,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Material-UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function HistorialEventos() {
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const pageSize = 10;

  useEffect(() => {
    document.title = 'Mi Historial de Eventos';
    if (!usuario || usuario.rol !== 'operador') {
      navigate('/', { replace: true });
      return;
    }
    fetchHistorialEventos();
  }, [usuario, navigate, page, searchQuery]);

  const fetchHistorialEventos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/eventos-operador/historial', {
        headers: {
          Authorization: `Bearer ${usuario.token}`,
        },
        params: {
          page: page - 1,
          pageSize: pageSize,
          search: searchQuery,
        },
      });
      setEventos(response.data.data);
      setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (err) {
      console.error('Error al obtener historial de eventos:', err);
      if (err.response && err.response.status === 403) {
        setError('No tienes permiso para ver esta información.');
      } else {
        setError('Error al cargar el historial de eventos.');
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
      setPage(1);
      fetchHistorialEventos();
    }
  };

  const handleGoBack = () => {
    navigate('/operador-menu');
  };

  const handleRegistrarEvento = () => {
    navigate('/operador/registrar-evento'); // Ruta para el nuevo formulario de registro de evento
  };

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
          MI HISTORIAL DE EVENTOS
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
          placeholder="Buscar por freezer, cliente o tipo de evento..."
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
        ) : eventos.length === 0 ? (
          <Alert severity="info">No se encontraron eventos en tu historial.</Alert>
        ) : (
          <>
            {eventos.map((evento) => (
              <Paper key={evento.evento_id} sx={cardStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    Evento: {evento.tipo}
                  </Typography>
                  <Chip
                    label={evento.tipo}
                    color={evento.tipo.toLowerCase() === 'entrega' ? 'success' : 'info'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Typography sx={infoTextStyle}>
                  <EventIcon fontSize="small" /> <span style={{ fontWeight: 'bold' }}>Fecha:</span> {new Date(evento.fecha).toLocaleDateString()}
                  {' '}
                  <span style={{ fontWeight: 'bold' }}>Hora:</span> {new Date(evento.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
                <Typography sx={infoTextStyle}>
                  <AcUnitIcon fontSize="small" /> <span style={{ fontWeight: 'bold' }}>Freezer:</span> {evento.freezer_numero_serie} ({evento.freezer_modelo})
                </Typography>
                <Typography sx={infoTextStyle}>
                  <BusinessIcon fontSize="small" /> <span style={{ fontWeight: 'bold' }}>Cliente:</span> {evento.cliente_nombre}
                </Typography>
                <Typography sx={infoTextStyle}>
                  <PersonIcon fontSize="small" /> <span style={{ fontWeight: 'bold' }}>Operador:</span> {evento.usuario_nombre}
                </Typography>
                {evento.observaciones && (
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', mt: 1 }}>
                    <span style={{ fontWeight: 'bold' }}>Obs:</span> {evento.observaciones}
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

        {/* Botón para Registrar Nuevo Evento */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleRegistrarEvento}
            sx={{
              padding: theme.spacing(1.5, 3),
              borderRadius: '25px',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Registrar Nuevo Evento
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default HistorialEventos;
