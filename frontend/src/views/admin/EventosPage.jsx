import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    Paper,
    TextField,
    Button,
    Grid,
    Link,
    MenuItem,
    Chip,
    IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import axiosInstance from '../../api/axios'
import { UserContext } from '../../context/UserContext';
import {
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function EventosPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    const [eventos, setEventos] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtroUsuarioNombre, setFiltroUsuarioNombre] = useState('');
    const [filtroClienteNombre, setFiltroClienteNombre] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState(null);
    const [filtroFechaHasta, setFiltroFechaHasta] = useState(null);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroObservaciones, setFiltroObservaciones] = useState('');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const tiposEvento = ['Entrega', 'Retiro', 'Mantenimiento'];

    const [triggerSearch, setTriggerSearch] = useState(0);

    const fetchEventos = useCallback(async (searchParams) => {
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();

            if (searchParams.usuario_nombre) queryParams.append('usuario_nombre', searchParams.usuario_nombre);
            if (searchParams.cliente_nombre) queryParams.append('cliente_nombre', searchParams.cliente_nombre);
            if (searchParams.fechaDesde) queryParams.append('fechaDesde', searchParams.fechaDesde);
            if (searchParams.fechaHasta) queryParams.append('fechaHasta', searchParams.fechaHasta);
            if (searchParams.tipo) queryParams.append('tipo', searchParams.tipo);
            if (searchParams.observaciones) queryParams.append('observaciones', searchParams.observaciones);

            queryParams.append('page', searchParams.page);
            queryParams.append('pageSize', searchParams.pageSize);

            const url = `/eventos?${queryParams.toString()}`;

            const response = await axiosInstance.get(url)

            setEventos(response.data.data);
            setTotalRegistros(response.data.total);
        } catch (err) {
            console.error('Error al obtener eventos:', err);
            setError('Error al cargar los eventos. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        document.title = 'Historial de Eventos - Admin';

        const currentSearchParams = {
            usuario_nombre: filtroUsuarioNombre,
            cliente_nombre: filtroClienteNombre,
            fechaDesde: filtroFechaDesde,
            fechaHasta: filtroFechaHasta,
            tipo: filtroTipo,
            observaciones: filtroObservaciones,
            page: page,
            pageSize: rowsPerPage,
        };

        fetchEventos(currentSearchParams);
    }, [fetchEventos, page, rowsPerPage, triggerSearch]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleApplyFilters = () => {
        setPage(0);
        setTriggerSearch(prev => prev + 1);
    };

    const handleClearFilters = () => {
        setFiltroUsuarioNombre('');
        setFiltroClienteNombre('');
        setFiltroFechaDesde('');
        setFiltroFechaHasta('');
        setFiltroTipo('');
        setFiltroObservaciones('');
        setPage(0);
        setTriggerSearch(prev => prev + 1);
    };

    if (loading && eventos.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            {/* Flecha de vuelta */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handleGoBack} aria-label="Volver">
                    <ArrowBackIcon fontSize='large' />
                </IconButton>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    HISTORIAL DE EVENTOS
                </Typography>

                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Filtros</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Usuario"
                                variant="outlined"
                                fullWidth
                                value={filtroUsuarioNombre}
                                onChange={(e) => setFiltroUsuarioNombre(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Cliente"
                                variant="outlined"
                                fullWidth
                                value={filtroClienteNombre}
                                onChange={(e) => setFiltroClienteNombre(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Tipo de Evento"
                                select
                                variant="outlined"
                                fullWidth
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {tiposEvento.map((tipo) => (
                                    <MenuItem key={tipo} value={tipo}>
                                        {tipo}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Observaciones"
                                variant="outlined"
                                fullWidth
                                value={filtroObservaciones}
                                onChange={(e) => setFiltroObservaciones(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                                label="Fecha Desde"
                                value={filtroFechaDesde}
                                onChange={(newValue) => setFiltroFechaDesde(newValue)}
                                format='dd/MM/yyyy'
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                                label="Fecha Hasta"
                                value={filtroFechaHasta}
                                onChange={(newValue) => setFiltroFechaHasta(newValue)}
                                format='dd/MM/yyyy'
                                minDate={filtroFechaDesde}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                onClick={handleApplyFilters}
                                sx={{ mr: 1 }}
                            >
                                Aplicar Filtros
                            </Button>
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

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading && eventos.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader aria-label="tabla de eventos">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>N° Serie Freezer</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Modelo Freezer</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Observaciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {eventos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No se encontraron eventos con los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        eventos.map((evento) => (
                                            <TableRow hover key={evento.id}>
                                                <TableCell>{evento.fecha ? format(new Date(evento.fecha), 'dd-MM-yyyy HH:mm') : 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={evento.tipo ? evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1) : 'N/A'}
                                                        sx={{
                                                            backgroundColor:
                                                                evento.tipo === 'entrega'
                                                                    ? '#e8f5e9'
                                                                    : evento.tipo === 'retiro'
                                                                        ? '#ffebee'
                                                                        : '#e3f2fd',
                                                            color:
                                                                evento.tipo === 'entrega'
                                                                    ? '#388e3c'
                                                                    : evento.tipo === 'retiro'
                                                                        ? '#d32f2f'
                                                                        : '#1e88e5',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.75rem',
                                                        }}


                                                    />
                                                </TableCell>
                                                <TableCell>{evento.usuario_nombre}</TableCell>
                                                <TableCell>{evento.cliente_nombre}</TableCell>
                                                <TableCell>
                                                    {evento.numero_serie_freezer ? (
                                                        <Link
                                                            component="button"
                                                            variant="body2"
                                                            onClick={() => handleFreezerClick(evento.freezer_id)}
                                                        >
                                                            {evento.numero_serie_freezer}
                                                        </Link>
                                                    ) : 'N/A'}
                                                </TableCell>
                                                <TableCell>{evento.modelo_freezer || 'N/A'}</TableCell>
                                                <TableCell>{evento.observaciones}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
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

export default EventosPage;