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
import { es } from 'date-fns/locale';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import axiosInstance from '../../api/axios'
import { UserContext } from '../../context/UserContext';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function AuditoriaPage() {

  const { usuario } = useContext(UserContext);
  const token = usuario?.token;
  const navigate = useNavigate();

  const [registrosAuditoria, setRegistrosAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para los filtros (actualizan al escribir, pero no disparan la API)
  const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
  const [filtroUsuarioNombre, setFiltroUsuarioNombre] = useState('');
  const [filtroAccionContenido, setFiltroAccionContenido] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState(null);
  const [filtroFechaHasta, setFiltroFechaHasta] = useState(null);

  // Estados para la paginación (disparan la API)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Estado para disparar la búsqueda de filtros y la carga inicial
  const [triggerSearch, setTriggerSearch] = useState(0);

  const fetchAuditoria = useCallback(async (searchParams) => {
    if (!token) {
      setError('No hay token de autenticación. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    // Antes de iniciar la petición, activa el estado de carga para mostrar el spinner y borrar cualquier error anterior
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      // Añadir filtros al queryParams
      if (searchParams.usuarioId) queryParams.append('usuarioId', searchParams.usuarioId);
      if (searchParams.usuarioNombre) queryParams.append('usuarioNombre', searchParams.usuarioNombre);
      if (searchParams.accion) queryParams.append('accion', searchParams.accion);

      // Formatear fechas si existen
      if (searchParams.fechaDesde) {
        queryParams.append('fechaDesde', format(searchParams.fechaDesde, 'yyyy-MM-dd'));
      }
      if (searchParams.fechaHasta) {
        queryParams.append('fechaHasta', format(searchParams.fechaHasta, 'yyyy-MM-dd'));
      }

      // Añadir paginación al queryParams
      queryParams.append('page', searchParams.page);
      queryParams.append('pageSize', searchParams.pageSize);

      const url = `/auditoria?${queryParams.toString()}`;

      const response = await axiosInstance.get(url);

      setRegistrosAuditoria(response.data.data);
      setTotalRegistros(response.data.total);

    } catch (err) {
      console.error('Error al obtener registros de auditoría:', err);
      setError('Error al cargar los registros de auditoría. Inténtalo de nuevo más tarde.');
      setRegistrosAuditoria([]); // Limpiar la tabla en caso de error
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    document.title = 'Auditoría - Admin';

    const currentSearchParams = {
      usuarioId: filtroUsuarioId,
      usuarioNombre: filtroUsuarioNombre,
      accion: filtroAccionContenido,
      fechaDesde: filtroFechaDesde,
      fechaHasta: filtroFechaHasta,
      page: page,
      pageSize: rowsPerPage,
    };

    fetchAuditoria(currentSearchParams);
  }, [fetchAuditoria, page, rowsPerPage, triggerSearch]); // Dependencias que disparan la búsqueda

  // Manejadores de eventos para la paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0); // Volver a la primera página.
  };

  const handleApplyFilters = () => {
    setPage(0); // Resetear a la primera página al aplicar filtros
    setTriggerSearch(prev => prev + 1); // Incrementa el contador para forzar el useEffect
  };

  const handleGoBack = () => {
    navigate('/admin-dashboard');
  };

  const handleClearFilters = () => {
    setFiltroUsuarioId('');
    setFiltroUsuarioNombre('');
    setFiltroAccionContenido('');
    setFiltroFechaDesde(null);
    setFiltroFechaHasta(null);
    setPage(0);
    setRowsPerPage(10); // Restablece filas por página al limpiar
    setTriggerSearch(prev => prev + 1); // Incrementa el contador para forzar el useEffect
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      {/* Flecha de vuelta */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handleGoBack} aria-label="Volver">
          <ArrowBackIcon fontSize='large' />
        </IconButton>
      </Box>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Auditoría de Actividades
        </Typography>

        <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filtros de Búsqueda</Typography>
          <Grid container spacing={2} alignItems="center">
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
            {/* Filtro por Contenido de Acción */}
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
            {/* Filtro por Fecha Desde */}
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Fecha Desde"
                value={filtroFechaDesde}
                onChange={(newValue) => setFiltroFechaDesde(newValue)}
                format='dd/MM/yyyy'
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            {/* Filtro por Fecha Hasta */}
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Fecha Hasta"
                value={filtroFechaHasta}
                onChange={(newValue) => setFiltroFechaHasta(newValue)}
                format='dd/MM/yyyy'
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
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
                      <TableCell>{new Date(registro.fecha_hora).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false // Formato 24 horas
                      })}</TableCell>
                      <TableCell>{registro.accion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalRegistros}
              rowsPerPage={rowsPerPage}
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