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
    MenuItem,
    IconButton,
    Chip,
    Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import axiosInstance from '../../api/axios'
import { UserContext } from '../../context/UserContext';
import {
    Edit as EditIcon,
    ContentCopy as ContentCopyIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Add as AddIcon
} from '@mui/icons-material'; // Iconos de Material-UI
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { es } from 'date-fns/locale';

function FreezersPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    // Estados para los datos de la tabla
    const [freezers, setFreezers] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [filtroModelo, setFiltroModelo] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroCapacidad, setFiltroCapacidad] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroNSerie, setFiltroNSerie] = useState('');
    const [filtroFechaCompra, setFiltroFechaCompra] = useState('');

    const [dashboardData, setDashboardData] = useState(null);

    // Estados para la paginación
    const [page, setPage] = useState(0); // Página actual (0-indexed)
    const [rowsPerPage, setRowsPerPage] = useState(10); // Elementos por página

    // Opciones para el filtro de estado
    const estadosFreezer = ['Disponible', 'Asignado', 'Mantenimiento', 'Baja', 'Dañado/Baja'];

    // Estado para disparar la búsqueda de filtros y la carga inicial
    const [triggerSearch, setTriggerSearch] = useState(0);

    // Función para obtener los datos de los freezers
    const fetchFreezers = useCallback(async (searchParams) => {

        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setLoading(false);

            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();

            if (searchParams.modelo) queryParams.append('modelo', searchParams.modelo);
            if (searchParams.tipo) queryParams.append('tipo', searchParams.tipo);
            if (searchParams.capacidad) queryParams.append('capacidad', searchParams.capacidad);
            if (searchParams.estado) queryParams.append('estado', searchParams.estado);
            if (searchParams.nserie) queryParams.append('nserie', searchParams.nserie);

            if (searchParams.fechaCompra) queryParams.append('fechaCompra', searchParams.fechaCompra);

            queryParams.append('page', searchParams.page);
            queryParams.append('pageSize', searchParams.pageSize);

            const url = `/freezers?${queryParams.toString()}`;

            const response = await axiosInstance.get(url)


            setFreezers(response.data.data);
            setTotalRegistros(response.data.total);
        } catch (err) {
            console.error('Error al obtener freezers:', err);
            setError('Error al cargar los freezers. Inténtelo de nuevo.');

        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchDashboard = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/dashboard')
            setDashboardData(data);

        } catch (err) {
            console.error('Error al obtener datos del dashboard:', err)
        }

    }, [])

    useEffect(() => {
        document.title = 'Listado de Freezers - Admin';

        const currentSearchParams = {
            modelo: filtroModelo,
            tipo: filtroTipo,
            capacidad: filtroCapacidad,
            estado: filtroEstado,
            nserie: filtroNSerie,
            fechaCompra: filtroFechaCompra,
            page: page,
            pageSize: rowsPerPage,
        };

        fetchFreezers(currentSearchParams);

        fetchDashboard();

    }, [fetchFreezers, fetchDashboard, page, rowsPerPage, triggerSearch, filtroModelo, filtroTipo, filtroCapacidad, filtroEstado, filtroNSerie, filtroFechaCompra]);


    // Manejadores de paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0); // Volver a la primera página cuando cambian los elementos por página
        fetchFreezers({ page: 0, pageSize: newSize })
    };

    // Manejadores de filtros
    const handleApplyFilters = () => {
        setPage(0); // Resetear a la primera página al aplicar filtros
        setTriggerSearch(prev => prev + 1);
    };

    const handleClearFilters = () => {
        setFiltroModelo('');
        setFiltroTipo('');
        setFiltroCapacidad('');
        setFiltroEstado('');
        setFiltroNSerie('');
        setFiltroFechaCompra('');
        setPage(0); // Resetear a la primera página
        setTriggerSearch(prev => prev + 1);
    };

    // Funciones de Acciones en la tabla
    const handleCopyData = (freezer) => {
        const dataToCopy = `N° Serie: ${freezer.numero_serie}, Modelo: ${freezer.modelo}, Tipo: ${freezer.tipo}, Capacidad: ${freezer.capacidad}, Estado: ${freezer.estado}`;
        navigator.clipboard.writeText(dataToCopy)
            .then(() => alert('Datos del freezer copiados al portapapeles'))
            .catch(err => console.error('Error al copiar:', err));
    };

    const handleEditFreezer = (id) => {
        navigate(`/freezers/editar/${id}`);
    };

    const handleViewFreezerDetail = (id) => {
        navigate(`/freezers/${id}`)
    }

    const handleAssignClient = (id) => {
        navigate(`/freezers/${id}/asignar`);
    };

    const handleRegisterNewFreezer = () => {
        navigate('/freezers/nuevo');
    };

    const handleViewEventsHistory = () => {
        navigate('/eventos');
    };

    const handleViewStats = () => {
        navigate('/estadisticas-freezers');
    };

    const handleGoBack = () => {
        navigate('/admin-dashboard');
    };

    const handleDesasignarFreezer = async (freezerId, numero_serie) => {
        if (!window.confirm(`Está seguro que desea desasignar el freezer Nº de Serie: ${numero_serie} del cliente actual y establecerlo como "Disponible"?`)){
            return;
        }
        setLoading(true);
        setError(null);

        try {
            await axiosInstance.patch(`/freezers/${freezerId}/desasignar`)

            alert(`Freezer desasignado correctamente.`);
            setTriggerSearch(prev => prev + 1);

        } catch (err) {
            console.error('Error al desasignar freezer:', err);
            setError(`Error al desasignar el freezer: ${err.response?.data?.message || err.message}.`);
        } finally {
            setLoading(false);
        }
        
    }

    const handleViewClientDetail = (clienteId) => {
        navigate(`/clientes/${clienteId}`)
    };



    if (loading && freezers.length === 0) {
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
                    <ArrowBackIcon />
                </IconButton>
            </Box>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    LISTA DE FREEZERS
                </Typography>

                {/* --- Sección de Botones Grandes --- */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid >
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Registrar Freezer</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleRegisterNewFreezer}
                            >
                                Nuevo
                            </Button>
                        </Paper>
                    </Grid>
                    <Grid >
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Historial de eventos</Typography>
                            <Button
                                variant="contained"
                                onClick={handleViewEventsHistory}
                                disabled={true}
                            >
                                Ver actividad
                            </Button>
                        </Paper>
                    </Grid>
                    <Grid >
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Entregas vs Retiros</Typography>
                            <Button
                                variant="contained"
                                onClick={handleViewStats}
                                disabled={true}
                            >
                                Ver estadísticas
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                {/* --- Sección de Filtros --- */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Filtros</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid>
                            <TextField
                                label="Modelo"
                                variant="outlined"
                                fullWidth
                                value={filtroModelo}
                                onChange={(e) => setFiltroModelo(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                label="Tipo"
                                variant="outlined"
                                fullWidth
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                label="N° de Serie"
                                variant="outlined"
                                fullWidth
                                value={filtroNSerie}
                                onChange={(e) => setFiltroNSerie(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                label="Capacidad"
                                variant="outlined"
                                fullWidth
                                value={filtroCapacidad}
                                onChange={(e) => setFiltroCapacidad(e.target.value)}
                                type="number"
                                size="small"
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                select
                                label="Estado"
                                variant="outlined"
                                fullWidth
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {estadosFreezer.map((estado) => (
                                    <MenuItem key={estado} value={estado}>
                                        {estado}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid>
                            <TextField
                                label="Fecha Compra"
                                type="date"
                                variant="outlined"
                                fullWidth
                                value={filtroFechaCompra}
                                onChange={(e) => setFiltroFechaCompra(e.target.value)}
                                InputLabelProps={{ shrink: true }}
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

                {loading && freezers.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader aria-label="tabla de freezers">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Imagen</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Compra</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Modelo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>N° de Serie</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Capacidad</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Marca</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Acción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {freezers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                No se encontraron freezers con los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        freezers.map((freezer) => (
                                            <TableRow hover key={freezer.id}>
                                                <TableCell>
                                                    {freezer.imagen ? (
                                                        <Box
                                                            component={"img"}
                                                            src={freezer.imagen}
                                                            alt={`Imagen de ${freezer.modelo}`}
                                                            sx={{
                                                                width: 50,
                                                                height: 50,
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                            }}
                                                        />
                                                    ) : (<Box
                                                        component={"img"}
                                                        src='https://img.freepik.com/premium-vector/modern-refrigerator-vector-illustration-white-background_1138840-2108.jpg'
                                                        alt='Imagen no disponible'
                                                        sx={{
                                                            width: 50,
                                                            height: 50,
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                            backgroundColor: '#f0f0f0'
                                                        }} />)}
                                                </TableCell>
                                                <TableCell>{freezer.fecha_creacion ? format(new Date(freezer.fecha_creacion), 'dd-MM-yyyy') : 'N/A'}</TableCell>
                                                <TableCell>{freezer.modelo}</TableCell>

                                                <TableCell>
                                                    <Typography
                                                        component='span'
                                                        onClick={() => handleViewFreezerDetail(freezer.id)}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            color: 'primary.main',
                                                            textDecoration: 'underline',
                                                            '&:hover': {
                                                                color: 'primary.dark'
                                                            }
                                                        }}>
                                                        {freezer.numero_serie}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>{freezer.tipo}</TableCell>
                                                <TableCell>{freezer.capacidad}</TableCell>
                                                <TableCell>{freezer.marca || 'N/A'}</TableCell>
                                                <TableCell >
                                                    <Chip
                                                        label={freezer.estado}
                                                        sx={{
                                                            backgroundColor:
                                                            freezer.estado === 'Disponible'
                                                            ? '#e8f5e9'
                                                            : freezer.estado === 'Asignado'
                                                            ? '#e3f2fd'
                                                            : '#ffebee',
                                                            color:
                                                            freezer.estado === 'Disponible'
                                                            ? '#388e3c'
                                                            : freezer.estado === 'Asignado'
                                                            ? '#1e88e5'
                                                            : '#d32f2f',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.75rem',
                                                        }}
                                                        />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        component='span'
                                                        onClick={() => handleViewClientDetail(freezer.cliente_id)}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            color: 'primary.main',
                                                            textDecoration: 'underline',
                                                            '&:hover': {
                                                                color: 'primary.dark'
                                                            }
                                                        }}>
                                                        {freezer.nombre_responsable_cliente || ''}
                                                    </Typography>
                                                    
                                                    </TableCell>
                                                <TableCell align="right">
                                                    <IconButton aria-label="copiar" onClick={() => handleCopyData(freezer)}>
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton aria-label="editar" onClick={() => handleEditFreezer(freezer.id)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>

                                                    {freezer.estado === 'Disponible' && (
                                                        <Tooltip title='Asignar cliente'>
                                                            <IconButton aria-label="asignar cliente" onClick={() => handleAssignClient(freezer.id)}>
                                                                <PersonAddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                    {freezer.estado === 'Asignado' && (
                                                        <Tooltip title='Desasignar cliente'>
                                                            <IconButton aria-label="desasignar cliente" onClick={() => handleDesasignarFreezer(freezer.id, freezer.numero_serie)}>
                                                                <PersonRemoveIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
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
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                        />
                    </Paper>
                )}

                {/* --- Indicadores Inferiores --- */}
                <Grid container spacing={2} sx={{ mt: 4 }}>
                    <Grid>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Freezers activos</Typography>
                            <Typography variant="h3">{dashboardData.freezersPrestados}</Typography> 
                            
                        </Paper>
                    </Grid>
                    <Grid>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Mantenimientos pendientes</Typography>
                            <Typography variant="h3">{dashboardData.mantenimientosPendientes}</Typography> 
                        </Paper>
                    </Grid>
                </Grid>

            </Container>
        </LocalizationProvider>
    );
}

export default FreezersPage;

