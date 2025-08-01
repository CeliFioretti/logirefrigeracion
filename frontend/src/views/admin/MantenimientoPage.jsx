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
    Link,
    TableCell,
    TablePagination,
    Paper,
    TextField,
    Button,
    Grid,
    MenuItem,
    IconButton,
    Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import axiosInstance from '../../api/axios'
import { UserContext } from '../../context/UserContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Edit as EditIcon,
    ContentCopy as ContentCopyIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

function MantenimientoPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    const [mantenimientos, setMantenimientos] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtroUsuarioNombre, setFiltroUsuarioNombre] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState(null);
    const [filtroFechaHasta, setFiltroFechaHasta] = useState(null);
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroObservaciones, setFiltroObservaciones] = useState('');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const tiposMantenimiento = ['Preventivo', 'Correctivo', 'Inspección', 'Reparación'];

    const [triggerSearch, setTriggerSearch] = useState(0);

    const fetchMantenimientos = useCallback(async (searchParams) => {
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
            if (searchParams.fechaDesde) queryParams.append('fechaDesde', format(searchParams.fechaDesde, 'yyyy-MM-dd'));
            if (searchParams.fechaHasta) queryParams.append('fechaHasta', format(searchParams.fechaHasta, 'yyyy-MM-dd'));
            if (searchParams.descripcion) queryParams.append('descripcion', searchParams.descripcion);
            if (searchParams.tipo) queryParams.append('tipo', searchParams.tipo);
            if (searchParams.observaciones) queryParams.append('observaciones', searchParams.observaciones);

            queryParams.append('page', searchParams.page);
            queryParams.append('pageSize', searchParams.pageSize);

            const url = `/mantenimientos?${queryParams.toString()}`;

            const response = await axiosInstance.get(url)

            setMantenimientos(response.data.data);
            setTotalRegistros(response.data.total);
        } catch (err) {
            console.error('Error al obtener mantenimientos:', err);
            setError('Error al cargar los mantenimientos. Inténtelo de nuevo.');

        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        document.title = 'Listado de Mantenimientos - Admin';

        const currentSearchParams = {
            usuario_nombre: filtroUsuarioNombre,
            fechaDesde: filtroFechaDesde,
            fechaHasta: filtroFechaHasta,
            descripcion: filtroDescripcion,
            tipo: filtroTipo,
            observaciones: filtroObservaciones,
            page: page,
            pageSize: rowsPerPage,
        };

        fetchMantenimientos(currentSearchParams);
    }, [fetchMantenimientos, page, rowsPerPage, triggerSearch]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleViewFreezerDetail = (freezerId) => {
        navigate(`/freezers/${freezerId}`)
    };


    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        setTriggerSearch(prev => prev + 1);
    };

    const handleApplyFilters = () => {
        setPage(0);
        setTriggerSearch(prev => prev + 1);
    };

    const handleGoBack = () => {
        navigate('/admin-dashboard');
    };

    const handleClearFilters = () => {
        setFiltroUsuarioNombre('');
        setFiltroFechaDesde(null);
        setFiltroFechaHasta(null);
        setFiltroDescripcion('');
        setFiltroTipo('');
        setFiltroObservaciones('');
        setPage(0);
        setTriggerSearch(prev => prev + 1);
    };

    const handleCopyData = (mantenimiento) => {
        const dataToCopy = `Usuario: ${mantenimiento.usuario_nombre}, Fecha: ${format(new Date(mantenimiento.fecha), 'dd-MM-yyyy')}, Descripción: ${mantenimiento.descripcion}, Tipo: ${mantenimiento.tipo}, Observaciones: ${mantenimiento.observaciones}, Número de Serie Freezer: ${mantenimiento.numero_serie || 'N/A'}`;
        navigator.clipboard.writeText(dataToCopy)
            .then(() => alert('Datos del mantenimiento copiados al portapapeles'))
            .catch(err => console.error('Error al copiar:', err));
    };

    const handleEditMantenimiento = (id) => {
        navigate(`/mantenimientos/editar/${id}`);
    };

    const handleRegisterNewMantenimiento = () => {
        navigate('/mantenimientos/nuevo');
    };

    if (loading && mantenimientos.length === 0 && !error) {
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
                    LISTA DE MANTENIMIENTOS
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid >
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Registrar Mantenimiento</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleRegisterNewMantenimiento}
                            >
                                Nuevo
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Filtros</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid >
                            <TextField
                                label="Nombre de Usuario"
                                variant="outlined"
                                fullWidth
                                value={filtroUsuarioNombre}
                                onChange={(e) => setFiltroUsuarioNombre(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid >
                            <DatePicker
                                label="Fecha Desde"
                                value={filtroFechaDesde}
                                onChange={(newValue) => setFiltroFechaDesde(newValue)}
                                format='dd/MM/yyyy'
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </Grid>
                        <Grid >
                            <DatePicker
                                label="Fecha Hasta"
                                value={filtroFechaHasta}
                                onChange={(newValue) => setFiltroFechaHasta(newValue)}
                                format='dd/MM/yyyy'
                                minDate={filtroFechaDesde}
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </Grid>
                        <Grid >
                            <TextField
                                label="Descripción"
                                variant="outlined"
                                fullWidth
                                value={filtroDescripcion}
                                onChange={(e) => setFiltroDescripcion(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid >
                            <TextField
                                select
                                label="Tipo"
                                variant="outlined"
                                fullWidth
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {tiposMantenimiento.map((tipo) => (
                                    <MenuItem key={tipo} value={tipo}>
                                        {tipo}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid >
                            <TextField
                                label="Observaciones"
                                variant="outlined"
                                fullWidth
                                value={filtroObservaciones}
                                onChange={(e) => setFiltroObservaciones(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid>
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

                {loading && mantenimientos.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader aria-label="tabla de mantenimientos">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Número de Serie Freezer</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Observaciones</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Acción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mantenimientos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No se encontraron mantenimientos con los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        mantenimientos.map((mantenimiento) => (
                                            <TableRow hover key={mantenimiento.id}>
                                                <TableCell>{mantenimiento.fecha ? format(new Date(mantenimiento.fecha), 'dd-MM-yyyy') : 'N/A'}</TableCell>
                                                <TableCell>{mantenimiento.usuario_nombre}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        component="button"
                                                        variant="body1"
                                                        onClick={() => handleViewFreezerDetail(mantenimiento.freezer_id)}
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        {mantenimiento.numero_serie || 'N/A'}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{mantenimiento.descripcion}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={mantenimiento.tipo}
                                                        sx={{
                                                            backgroundColor:
                                                                mantenimiento.tipo === 'Preventivo'
                                                                    ? '#e8f5e9'
                                                                    : mantenimiento.tipo === 'Correctivo'
                                                                        ? '#ffebee'
                                                                        : '#e3f2fd',
                                                            color:
                                                                mantenimiento.tipo === 'Preventivo'
                                                                    ? '#388e3c'
                                                                    : mantenimiento.tipo === 'Correctivo'
                                                                        ? '#d32f2f'
                                                                        : '#1e88e5',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.75rem',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{mantenimiento.observaciones || 'N/A'}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton aria-label="copiar" onClick={() => handleCopyData(mantenimiento)}>
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton aria-label="editar" onClick={() => handleEditMantenimiento(mantenimiento.id)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
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
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`} `
                            }
                        />
                    </Paper>
                )}

            </Container>
        </LocalizationProvider>
    );
}


export default MantenimientoPage;