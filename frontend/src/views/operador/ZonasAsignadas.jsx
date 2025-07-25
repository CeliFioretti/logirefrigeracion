import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from '../../api/axios';

import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Pagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Material-UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicIcon from '@mui/icons-material/Public'; 

function ZonasAsignadas() {
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10; 

  useEffect(() => {
    document.title = 'Mis Zonas Asignadas';
    if (!usuario || usuario.rol !== 'operador') {
      navigate('/', { replace: true });
      return;
    }
    fetchZonasAsignadas();
  }, [usuario, navigate, page]); // Dependencias para recargar datos al cambiar página

  const fetchZonasAsignadas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/zonas-operador/mis-zonas', {
        headers: {
          Authorization: `Bearer ${usuario.token}`,
        },
        params: {
          page: page - 1,
          pageSize: pageSize,
        },
      });
      setZonas(response.data.data);
      setTotalPages(response.data.total ? Math.ceil(response.data.total / pageSize) : 1); 
    } catch (err) {
      console.error('Error al obtener zonas asignadas:', err);
      if (err.response && err.response.status === 403) {
        setError('No tienes permiso para ver esta información.');
      } else {
        setError('Error al cargar tus zonas asignadas.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleGoBack = () => {
    navigate('/operador-menu');
  };

  // Estilo para las tarjetas de zona
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: theme.spacing(2),
    boxShadow: theme.shadows[1],
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
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
          MIS ZONAS ASIGNADAS
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {/* Contenido principal */}
      <Box sx={{ width: '100%', maxWidth: '800px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : zonas.length === 0 ? (
          <Alert severity="info">No tienes zonas asignadas.</Alert>
        ) : (
          <>
            {zonas.map((zona) => (
              <Paper key={zona.zona_id} sx={cardStyle}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 1 }}>
                  {zona.nombre_zona}
                </Typography>
                <Typography sx={infoTextStyle}>
                  <PublicIcon fontSize="small" /> <span style={{ fontWeight: 'bold' }}>Departamento:</span> {zona.nombre_departamento}
                </Typography>
              </Paper>
            ))}

            {/* Paginación (proximamente) */}
            {totalPages > 1 && (
              <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size={isSmallScreen ? 'small' : 'medium'}
                />
              </Stack>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default ZonasAsignadas;