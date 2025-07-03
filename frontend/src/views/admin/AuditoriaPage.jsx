import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  TablePagination,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';  
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AuditoriaPage() {
  // Contexto
  const { usuario } = useContext(UserContext);
  const token = usuario?.token; 
  
  // Variables de estado
  const [registrosAuditoria, setRegistrosAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para los filtros simplificados
  const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
  const [filtroUsuarioNombre, setFiltroUsuarioNombre] = useState('');
  const [filtroAccionContenido, setFiltroAccionContenido] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState(null);
  const [filtroFechaHasta, setFiltroFechaHasta] = useState(null);

  // Estados para la paginación
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); // Filas por página deseadas
  const [totalRegistros, setTotalRegistros] = useState(0); // Total de registros en el Back

  // Función para construir los parámetros de la URL para la API
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (filtroUsuarioId) params.append('usuarioId', filtroUsuarioId);
    if (filtroUsuarioNombre) params.append('usuarioNombre', filtroUsuarioNombre);
    if (filtroAccionContenido) params.append('accion', filtroAccionContenido); 
    if (filtroFechaDesde) params.append('fechaDesde', format(filtroFechaDesde, 'yyyy-MM-dd'));
    if (filtroFechaHasta) params.append('fechaHasta', format(filtroFechaHasta, 'yyyy-MM-dd'));

    // Parámetros para la paginación
    params.append('page', page); // La página que queremos
    params.append('pageSize', rowsPerPage); // Cuantos elementos por página queremos 


    return params.toString();
  }, [
    filtroUsuarioId,
    filtroUsuarioNombre,
    filtroAccionContenido,
    filtroFechaDesde,
    filtroFechaHasta,
    page,
    rowsPerPage
  ]);

  const fetchAuditoria = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

      if (!token) {
        setError('No hay token de autenticación. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      const queryParams = buildQueryParams();
      const url = `http://localhost:3200/api/auditoria${queryParams ? `?${queryParams}` : ''}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setRegistrosAuditoria(response.data.data); // registros de la página actual
      setTotalRegistros(response.data.total) // total de registros que cumplen con los filtros

      setLoading(false);
    } catch (err) {
      console.error('Error al obtener registros de auditoría:', err);
      setError('Error al cargar los registros de auditoría. Inténtalo de nuevo más tarde.');
      setLoading(false);
    }
  }, [buildQueryParams]); // Este fetch se ejecutará cada vez que buildQueryParams cambie y este cambia si page o rowsPerPage cambia tambien 

  useEffect(() => {
    document.title = 'Auditoría - Admin';
    fetchAuditoria();
  }, [fetchAuditoria]);

  // Manejadores de eventos para la paginación de Material-UI
  const handleChangePage = (event, newPage) => {
    setPage(newPage); // Actualiza el estado de la página. Esto activará fetchAuditoria por la dependencia.
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Actualiza el estado de filas por página
    setPage(0); // Al cambiar la cantidad de filas, siempre volvemos a la primera página
  };

  const handleApplyFilters = () => {
    setPage(0); // Cuando se apliquen filtros, siempre volvemos a la primera página de los resultados filtrados.
    fetchAuditoria();
  };

  const handleClearFilters = () => {
    setFiltroUsuarioId('');
    setFiltroUsuarioNombre('');
    setFiltroAccionContenido('');
    setFiltroFechaDesde(null);
    setFiltroFechaHasta(null);
    setPage(0); // Resetreamos la página al limpiar filtros
    setRowsPerPage(10) // Resetea las filas por página a su valor por defecto
    // fetchAuditoria se ejecutará automáticamente debido al cambio de estado en los filtros
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Auditoría de Actividades
        </Typography>

        <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filtros de Búsqueda</Typography>
          <Grid container spacing={2} alignItems="center">
            {/* Filtro por Fecha Desde */}
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Fecha Desde"
                value={filtroFechaDesde}
                onChange={(newValue) => setFiltroFechaDesde(newValue)}
                format='dd/MM/yyyy'
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </Grid>
            {/* Filtro por Fecha Hasta */}
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Fecha Hasta"
                value={filtroFechaHasta}
                onChange={(newValue) => setFiltroFechaHasta(newValue)}
                format='dd/MM/yyyy'
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </Grid>
            {/* Filtro por ID de Usuario */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="ID Usuario"
                variant="outlined"
                size="small"
                fullWidth
                value={filtroUsuarioId}
                onChange={(e) => setFiltroUsuarioId(e.target.value)}
              />
            </Grid>
            {/* Filtro por Nombre de Usuario */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Nombre Usuario"
                variant="outlined"
                size="small"
                fullWidth
                value={filtroUsuarioNombre}
                onChange={(e) => setFiltroUsuarioNombre(e.target.value)}
              />
            </Grid>
            {/* Filtro por Contenido de Acción (ahora un TextField simple para buscar texto) */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Contenido de Acción"
                variant="outlined"
                size="small"
                fullWidth
                value={filtroAccionContenido}
                onChange={(e) => setFiltroAccionContenido(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {filtroAccionContenido && (
                        <IconButton
                          aria-label="clear search"
                          onClick={() => setFiltroAccionContenido('')}
                          edge="end"
                          size="small"
                        >
                          <ClearIcon />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12} sm={6} md={2}>
              <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleApplyFilters}
                            sx={{ mr: 1 }}
                        >
                            Aplicar Filtros
                        </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearFilters}
                        >
                            Limpiar Filtros
                        </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Cargando registros...</Typography>
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" py={5}>
            <Typography color="error" variant="h6">{error}</Typography>
          </Box>
        ) : registrosAuditoria.length === 0 ? (
          <Box display="flex" justifyContent="center" py={5}>
            <Typography variant="h6" color="text.secondary">No hay registros de auditoría para mostrar.</Typography>
          </Box>
        ) : (
          <Paper sx={{ p: 0, boxShadow: 3, borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Usuario ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha y Hora</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrosAuditoria.map((registro) => (
                    <TableRow key={registro.id} hover>
                      <TableCell>{registro.id}</TableCell>
                      <TableCell>{registro.usuario_id || 'N/A'}</TableCell>
                      <TableCell>{registro.usuario_nombre || 'N/A'}</TableCell>
                      {/* Formatea la fecha y hora para la visualización en la tabla */}
                      <TableCell>{new Date(registro.fecha_hora).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false // Formato 24 horas
                        })}</TableCell>
                      <TableCell>{registro.accion || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div" 
              count={totalRegistros} // ¡Este es el total de registros que se obtienen del back
              rowsPerPage={rowsPerPage} // La cantidad de filas que se muestran actualmente por página
              page={page} 
              onPageChange={handleChangePage} 
              onRowsPerPageChange={handleChangeRowsPerPage} 
              labelRowsPerPage="Filas por página:" 
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              } 
            />
          </Paper>
        )}
      </Container>
    </LocalizationProvider>
  );
}