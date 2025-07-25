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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import axiosInstance from '../../api/axios';
import { UserContext } from '../../context/UserContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

function ListadoAsignaciones() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    const [asignaciones, setAsignaciones] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Estados para filtros
    const [filtroUsuarioNombre, setFiltroUsuarioNombre] = useState('');
    const [filtroFreezerSerie, setFiltroFreezerSerie] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState(null);
    const [filtroFechaHasta, setFiltroFechaHasta] = useState(null);

    // Estados para paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Estados para el diálogo de confirmación de eliminación
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [asignacionToDelete, setAsignacionToDelete] = useState(null);

    const estadosAsignacion = ['pendiente', 'en curso', 'completada', 'cancelada', 'vencida'];

    // Trigger para recargar la tabla después de filtros o acciones
    const [triggerReload, setTriggerReload] = useState(0);

    const fetchAsignaciones = useCallback(async (searchParams) => {
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null); // Limpiar mensajes de éxito al recargar

        try {
            const queryParams = new URLSearchParams();

            if (searchParams.usuario_nombre) queryParams.append('usuario_nombre', searchParams.usuario_nombre);
            if (searchParams.freezer_numero_serie) queryParams.append('freezer_numero_serie', searchParams.freezer_numero_serie);
            if (searchParams.estado) queryParams.append('estado', searchParams.estado);
            if (searchParams.fechaDesde) queryParams.append('fechaDesde', format(searchParams.fechaDesde, 'yyyy-MM-dd'));
            if (searchParams.fechaHasta) queryParams.append('fechaHasta', format(searchParams.fechaHasta, 'yyyy-MM-dd'));

            queryParams.append('page', searchParams.page);
            queryParams.append('pageSize', searchParams.pageSize);

            const url = `/asignaciones-mantenimiento?${queryParams.toString()}`;

            const response = await axiosInstance.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAsignaciones(response.data.data);
            setTotalRegistros(response.data.total);
        } catch (err) {
            console.error('Error al obtener asignaciones:', err);
            setError(err.response?.data?.error || 'Error al cargar las asignaciones. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        document.title = 'Asignaciones de Mantenimiento - Admin';

        const currentSearchParams = {
            usuario_nombre: filtroUsuarioNombre,
            freezer_numero_serie: filtroFreezerSerie,
            estado: filtroEstado,
            fechaDesde: filtroFechaDesde,
            fechaHasta: filtroFechaHasta,
            page: page,
            pageSize: rowsPerPage,
        };

        fetchAsignaciones(currentSearchParams);
    }, [fetchAsignaciones, page, rowsPerPage, triggerReload]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const capitalizeFirstLetter = (string) => {
    if (!string) return ''; // Maneja casos donde la cadena es null, undefined o vacía
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0); // Resetear a la primera página al cambiar el tamaño
        setTriggerReload(prev => prev + 1); // Forzar recarga
    };

    const handleApplyFilters = () => {
        setPage(0); // Resetear a la primera página al aplicar filtros
        setTriggerReload(prev => prev + 1); // Forzar recarga con los nuevos filtros
    };

    const handleClearFilters = () => {
        setFiltroUsuarioNombre('');
        setFiltroFreezerSerie('');
        setFiltroEstado('');
        setFiltroFechaDesde(null);
        setFiltroFechaHasta(null);
        setPage(0);
        setTriggerReload(prev => prev + 1);
    };

    const handleGoBack = () => {
        navigate('/admin-dashboard'); // Volver al menú de administrador
    };

    const handleCreateNewAsignacion = () => {
        navigate('/asignaciones-mantenimiento/nuevo');
    };

    const handleEditAsignacion = (id) => {
        navigate(`/asignaciones/editar/${id}`);
    };

    const handleDeleteClick = (asignacion) => {
        setAsignacionToDelete(asignacion);
        setOpenConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        setOpenConfirmDialog(false);
        if (asignacionToDelete) {
            try {
                await axiosInstance.delete(`/asignaciones-mantenimiento/${asignacionToDelete.asignacion_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMessage('Asignación eliminada correctamente.');
                setTriggerReload(prev => prev + 1); // Recargar la lista
            } catch (err) {
                console.error('Error al eliminar asignación:', err.response?.data?.error || err.message);
                setError(err.response?.data?.error || 'Error al eliminar la asignación.');
            } finally {
                setAsignacionToDelete(null);
            }
        }
    };

    const handleCancelDelete = () => {
        setOpenConfirmDialog(false);
        setAsignacionToDelete(null);
    };

    const handleCopyData = (asignacion) => {
        const dataToCopy = `Asignación ID: ${asignacion.asignacion_id}, Operador: ${asignacion.usuario_nombre}, Freezer Serie: ${asignacion.numero_serie}, Fecha Asignación: ${format(new Date(asignacion.fecha_asignacion), 'dd-MM-yyyy')}, Estado: ${asignacion.estado}, Observaciones: ${asignacion.asignacion_observaciones || 'N/A'}`;
        navigator.clipboard.writeText(dataToCopy)
            .then(() => alert('Datos de la asignación copiados al portapapeles'))
            .catch(err => console.error('Error al copiar:', err));
    };

    // Renderizado condicional para carga inicial
    if (loading && asignaciones.length === 0 && !error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handleGoBack} aria-label="Volver">
                    <ArrowBackIcon fontSize='large' />
                </IconButton>
            </Box>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    LISTADO DE ASIGNACIONES DE MANTENIMIENTO
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Crear Nueva Asignación</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateNewAsignacion}
                                sx={{ mt: 1 }}
                            >
                                Nueva Asignación
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Filtros</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Nombre Operador"
                                variant="outlined"
                                fullWidth
                                value={filtroUsuarioNombre}
                                onChange={(e) => setFiltroUsuarioNombre(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Número de Serie Freezer"
                                variant="outlined"
                                fullWidth
                                value={filtroFreezerSerie}
                                onChange={(e) => setFiltroFreezerSerie(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
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
                                {estadosAsignacion.map((estado) => (
                                    <MenuItem key={estado} value={estado}>
                                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                                label="Fecha Desde"
                                value={filtroFechaDesde}
                                onChange={(newValue) => setFiltroFechaDesde(newValue)}
                                format='dd/MM/yyyy'
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                                label="Fecha Hasta"
                                value={filtroFechaHasta}
                                onChange={(newValue) => setFiltroFechaHasta(newValue)}
                                format='dd/MM/yyyy'
                                minDate={filtroFechaDesde}
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
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
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                {loading && asignaciones.length === 0 && !error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader aria-label="tabla de asignaciones de mantenimiento">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Creación</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Asignación</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Operador</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Freezer (Serie)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Observaciones</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {asignaciones.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                No se encontraron asignaciones con los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        asignaciones.map((asignacion) => (
                                            <TableRow hover key={asignacion.asignacion_id}>
                                                <TableCell>{asignacion.asignacion_id}</TableCell>
                                                <TableCell>{format(new Date(asignacion.fecha_creacion), 'dd-MM-yyyy HH:mm')}</TableCell>
                                                <TableCell>{format(new Date(asignacion.fecha_asignacion), 'dd-MM-yyyy')}</TableCell>
                                                <TableCell>{asignacion.usuario_nombre}</TableCell>
                                                <TableCell>{asignacion.numero_serie}</TableCell>
                                                <TableCell>{asignacion.cliente_nombre}</TableCell>
                                                <TableCell>{capitalizeFirstLetter(asignacion.tipo_asignacion)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={asignacion.estado.charAt(0).toUpperCase() + asignacion.estado.slice(1)}
                                                        color={
                                                            asignacion.estado === 'pendiente' ? 'info' :
                                                            asignacion.estado === 'en curso' ? 'primary' :
                                                            asignacion.estado === 'completada' ? 'success' :
                                                            asignacion.estado === 'cancelada' ? 'error' :
                                                            asignacion.estado === 'vencida' ? 'warning' : 'default'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{asignacion.asignacion_observaciones || ''}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton aria-label="copiar" onClick={() => handleCopyData(asignacion)}>
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton aria-label="editar" onClick={() => handleEditAsignacion(asignacion.asignacion_id)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton aria-label="eliminar" onClick={() => handleDeleteClick(asignacion)}>
                                                        <DeleteIcon fontSize="small" color="error" />
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

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog
                open={openConfirmDialog}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirmar Eliminación"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        ¿Está seguro de que desea eliminar la asignación para el freezer "{asignacionToDelete?.numero_serie}" asignada a "{asignacionToDelete?.usuario_nombre}"? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={loading}>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}

export default ListadoAsignaciones;
