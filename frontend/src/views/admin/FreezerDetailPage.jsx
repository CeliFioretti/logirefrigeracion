import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios'
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Button,
    Grid,
    Divider,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CardMedia,
    IconButton,
    Chip,
    TablePagination,
    Link
} from '@mui/material';

import {
    Edit as EditIcon,
    ContentCopy as ContentCopyIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Visibility as VisibilityIcon,
    Try
} from '@mui/icons-material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { UserContext } from '../../context/UserContext';

function FreezerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;

    // Estados Freezer
    const [freezer, setFreezer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados Mantenimientos
    const [mantenimientos, setMantenimientos] = useState([]);
    const [loadingMantenimientos, setLoadingMantenimientos] = useState(false);
    const [errorMantenimientos, setErrorMantenimientos] = useState(null);

    // Estados Cliente
    const [clienteAsignado, setClienteAsignado] = useState(null);
    const [loadingCliente, setLoadingCliente] = useState(false);
    const [errorCliente, setErrorCliente] = useState(null)

    const [filtroUsuarioNombre, setFiltroUsuarioNombre] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState(null);
    const [filtroFechaHasta, setFiltroFechaHasta] = useState(null);
    const [filtroTipo, setFiltroTipo] = useState('');

    const tiposMantenimiento = ['Reparacion', 'Preventivo', 'Inspección'];

    const [pageMant, setPageMantenimientos] = useState(0);
    const [rowsPerPageMant, setRowsPerPageMantenimientos] = useState(5);
    const [totalMantenimientos, setTotalMantenimientos] = useState(0);

    const [triggerSearch, setTriggerSearch] = useState(0);


    // Obtener datos del Freezer
    const fetchFreezerDetails = useCallback(async () => {
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const url = `http://localhost:3200/api/freezers/${id}`
            const response = await axiosInstance.get(url)

            setFreezer(response.data.data);

        } catch (err) {
            console.error('Error fetching freezer details:', err);
            setError('Error al cargar los detalles del freezer. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    // Obtener datos de mantenimientos del Freezer
    const fetchMantenimientos = useCallback(async (searchParams) => {
        if (!token || !id) {
            setErrorMantenimientos('No autenticado o ID de freezer no disponible.');
            setLoadingMantenimientos(false);
            return;
        }

        if (!id) {
            setLoadingMantenimientos(false)
            return;
        }

        setLoadingMantenimientos(true);
        setErrorMantenimientos(null);

        try {
            const queryParams = new URLSearchParams();

            if (searchParams.usuario_nombre) queryParams.append('usuario_nombre', searchParams.usuario_nombre);
            if (searchParams.fechaDesde) queryParams.append('fechaDesde', format(searchParams.fechaDesde, 'yyyy-MM-dd'));
            if (searchParams.fechaHasta) queryParams.append('fechaHasta', format(searchParams.fechaHasta, 'yyyy-MM-dd'));
            if (searchParams.tipo) queryParams.append('tipo', searchParams.tipo);

            queryParams.append('page', pageMant);
            queryParams.append('pageSize', rowsPerPageMant);

            const url = `http://localhost:3200/api/freezers/${id}/mantenimientos?${queryParams.toString()}`

            const response = await axiosInstance.get(url)

            setMantenimientos(response.data.data);
            setTotalMantenimientos(response.data.total);

        } catch (err) {
            console.error('Error fetching mantenimientos:', err);
            setErrorMantenimientos('Error al cargar el historial de mantenimientos.');
        } finally {
            setLoadingMantenimientos(false);
        }
    }, [id, token, filtroFechaDesde, filtroFechaHasta, filtroUsuarioNombre, pageMant, rowsPerPageMant]);

    // Obtener datos del cliente asignado
    const fetchClienteDetails = useCallback(async (clienteId) => {
        if (!token || !clienteId) {
            setClienteAsignado(null);
            return;
        }

        setLoadingCliente(true);
        setErrorCliente(null);

        try {
            const url = `http://localhost:3200/api/clientes/${clienteId}`
            const response = await axiosInstance.get(url)
            setClienteAsignado(response.data.data);
        } catch (err) {
            console.error('Error fetching client details:', err);
            setErrorCliente('Error al cargar los detalles del cliente asignado');
            setClienteAsignado(null)
        }
        finally {
            setLoadingCliente(false);
        }
    }, [token])

    useEffect(() => {
        if (freezer) {
            document.title = `Freezer #${freezer.numero_serie || ''} - Admin`

            // Comprobación de cliente para el freezer
            if (freezer.estado === 'Asignado' && freezer.cliente_id) {
                fetchClienteDetails(freezer.cliente_id)
            } else {
                setClienteAsignado(null);
            }
        } else {
            document.title = 'Detalle del Freezer - Admin'
        }
    }, [freezer]);


    useEffect(() => {
        fetchFreezerDetails();
    }, [fetchFreezerDetails]);

    useEffect(() => {
        if (id) {
            const currentSearchParams = {
                usuario_nombre: filtroUsuarioNombre,
                fechaDesde: filtroFechaDesde,
                fechaHasta: filtroFechaHasta,
                tipo: filtroTipo,
                page: pageMant,
                pageSize: rowsPerPageMant,
            };

            fetchMantenimientos(currentSearchParams);
        }
    }, [fetchMantenimientos, freezer, pageMant, rowsPerPageMant, triggerSearch, id]);


    const handleChangePageMantenimientos = (event, newPage) => {
        setPageMantenimientos(newPage);
    };

    const handleChangeRowsPerPageMantenimientos = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPageMantenimientos(newSize);
        setPageMantenimientos(0);
    };


    const handleEditFreezer = () => {
        navigate(`/admin/freezers/editar/${id}`);
    };

    const handleCopyFreezerData = () => {
        if (freezer) {
            const dataToCopy = `Número de Serie: ${freezer.numero_serie}\nModelo: ${freezer.modelo}\nMarca: ${freezer.marca}\nTipo: ${freezer.tipo}\nCapacidad: ${freezer.capacidad}\nEstado: ${freezer.estado}`;
            navigator.clipboard.writeText(dataToCopy)
                .then(() => alert('Datos del freezer copiados al portapapeles'))
                .catch(err => console.error('Error al copiar:', err));
        }
    };

    const handleGoBack = () => {
        navigate('/freezers');
    };

    const handleApplyFilters = () => {
        setPageMantenimientos(0);
        setTriggerSearch(prev => prev + 1);
    };

    const handleClearFilters = () => {
        setFiltroUsuarioNombre('');
        setFiltroFechaDesde(null);
        setFiltroFechaHasta(null);
        setFiltroTipo('');
        setPageMantenimientos(0);
        setTriggerSearch(prev => prev + 1);
    };

    const handleViewMantenimientoDetail = (mantenimientoId) => {
        console.log(`Ver detalles del mantenimiento ID: ${mantenimientoId}`);

    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/admin/freezers')}>
                    Volver al Listado
                </Button>
            </Container>
        );
    }

    if (!freezer) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="info">Freezer no encontrado o ID inválido.</Alert>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/admin/freezers')}>
                    Volver al Listado
                </Button>
            </Container>
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
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                    Freezer #{freezer.numero_serie || 'N/A'}
                </Typography>

                {/* Sección de Detalles del Freezer */}
                <Paper elevation={3} sx={{ p: 3, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>Detalles del Freezer</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid >
                                <Typography variant="subtitle1" color="text.secondary">Número de Serie:</Typography>
                                <Typography variant="body1" fontWeight="bold">{freezer.numero_serie || 'N/A'}</Typography>
                            </Grid>
                            <Grid >
                                <Typography variant="subtitle1" color="text.secondary">Modelo:</Typography>
                                <Typography variant="body1" fontWeight="bold">{freezer.modelo || 'N/A'}</Typography>
                            </Grid>
                            <Grid >
                                <Typography variant="subtitle1" color="text.secondary">Marca:</Typography>
                                <Typography variant="body1" fontWeight="bold">{freezer.marca || 'N/A'}</Typography>
                            </Grid>
                            <Grid >
                                <Typography variant="subtitle1" color="text.secondary">Tipo:</Typography>
                                <Typography variant="body1" fontWeight="bold">{freezer.tipo || 'N/A'}</Typography>
                            </Grid>
                            <Grid >
                                <Typography variant="subtitle1" color="text.secondary">Capacidad:</Typography>
                                <Typography variant="body1" fontWeight="bold">{freezer.capacidad ? `${freezer.capacidad} Litros` : 'N/A'}</Typography>
                            </Grid>
                            <Grid >
                                <Typography variant="subtitle1" color="text.secondary">Estado:</Typography>
                                <Chip
                                    label={freezer.estado || 'Desconocido'}
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
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Grid>

                        </Grid>
                        {/** Sección para Cliente */}
                        {freezer.estado === 'Asignado' && (
                            <Grid>
                                <Typography variant="subtitle1" color="text.secondary">Cliente Asignado:</Typography>
                                {loadingCliente ? (
                                    <CircularProgress size={20} />
                                ) : errorCliente ? (
                                    <Typography variant="body1" color="error">{errorCliente}</Typography>
                                ) : clienteAsignado ? (
                                    <Link
                                        component="button"
                                        variant="body1"
                                        onClick={() => handleViewClientDetail(clienteAsignado.id)}
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {clienteAsignado.nombre_responsable}
                                    </Link>
                                ) : (
                                    <Typography variant="body1" fontStyle="italic" color="text.secondary">
                                        No se pudo obtener la información del cliente.
                                    </Typography>
                                )}
                            </Grid>
                        )}
                    </Box>
                    <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 250 }, height: { xs: 200, md: 'auto' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {freezer.imagen ? (
                            <CardMedia
                                component="img"
                                image={freezer.imagen}
                                alt={`Imagen del Freezer ${freezer.numero_serie}`}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    boxShadow: 3
                                }}
                            />
                        ) : (
                            <Paper
                                elevation={1}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    bgcolor: 'grey.100',
                                    color: 'grey.500',
                                    borderRadius: 1
                                }}
                            >
                                <CameraAltIcon sx={{ fontSize: 60, mb: 1 }} />
                                <Typography variant="caption">Sin Imagen</Typography>
                            </Paper>
                        )}
                    </Box>
                </Paper>

                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                    Mantenimientos
                </Typography>
                {/* Sección de Filtros de Mantenimientos */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Filtros de Mantenimiento</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid >
                            <TextField
                                label="Operador (Nombre de Usuario)" // Actualizado el label
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
                                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                            />
                        </Grid>
                        <Grid >
                            <DatePicker
                                label="Fecha Hasta"
                                value={filtroFechaHasta}
                                onChange={(newValue) => setFiltroFechaHasta(newValue)}
                                format='dd/MM/yyyy'
                                minDate={filtroFechaDesde}
                                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
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

                {errorMantenimientos && <Alert severity="error" sx={{ mb: 2 }}>{errorMantenimientos}</Alert>}

                {loadingMantenimientos && mantenimientos.length === 0 ? (
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
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Observaciones</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Acción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mantenimientos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center"> {/* Ajusta el colSpan */}
                                                No se encontraron mantenimientos para este freezer con los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        mantenimientos.map((mantenimiento) => (
                                            <TableRow hover key={mantenimiento.id}>
                                                <TableCell>{mantenimiento.fecha ? format(new Date(mantenimiento.fecha), 'dd-MM-yyyy') : 'N/A'}</TableCell>
                                                <TableCell>{mantenimiento.usuario_nombre}</TableCell>
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
                            count={totalMantenimientos}
                            rowsPerPage={rowsPerPageMant}
                            page={pageMant}
                            onPageChange={handleChangePageMantenimientos}
                            onRowsPerPageChange={handleChangeRowsPerPageMantenimientos}
                            labelRowsPerPage="Filas por página:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`} `
                            }
                        />
                    </Paper>
                )}

                {/* Sección de Botones de Acción */}
                <Grid container spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                    <Grid >
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEditFreezer}
                        >
                            Editar datos del Freezer
                        </Button>
                    </Grid>
                    <Grid >
                        <Button
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopyFreezerData}
                        >
                            Copiar datos
                        </Button>
                    </Grid>                
                </Grid>
            </Container>
        </LocalizationProvider>
    );
}

export default FreezerDetailPage;