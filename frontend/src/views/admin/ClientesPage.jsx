import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    TableContainer,
    Table,
    Link,
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
    IconButton
} from '@mui/material';
import axiosInstance from '../../api/axios'
import { UserContext } from '../../context/UserContext';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as ContentCopyIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Add as AddIcon,
    Mail as MailIcon,
} from '@mui/icons-material'; // Iconos de Material-UI

import { useNavigate } from 'react-router-dom';

function ClientesPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    // Estados para los datos de la tabla
    const [clientes, setClientes] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [filtroNombreCliente, setFiltroNombreCliente] = useState('');
    const [filtroTipoNegocio, setFiltroTipoNegocio] = useState('');
    const [filtroNombreNegocio, setFiltroNombreNegocio] = useState('');
    const [filtroCuit, setFiltroCuit] = useState('');

    // Estados para la paginación
    const [page, setPage] = useState(0); // Página actual (0-indexed)
    const [rowsPerPage, setRowsPerPage] = useState(10); // Elementos por página

    // Estado para disparar la búsqueda de filtros y la carga inicial
    const [triggerSearch, setTriggerSearch] = useState(0);

    // Función para obtener los datos de los clientes
    const fetchClientes = useCallback(async (searchParams) => {
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();

            if (searchParams.nombreCliente) queryParams.append('nombreCliente', searchParams.nombreCliente);
            if (searchParams.tipoNegocio) queryParams.append('tipoNegocio', searchParams.tipoNegocio);
            if (searchParams.nombreNegocio) queryParams.append('nombreNegocio', searchParams.nombreNegocio);
            if (searchParams.cuit) queryParams.append('cuit', searchParams.cuit);

            queryParams.append('page', searchParams.page);
            queryParams.append('pageSize', searchParams.pageSize);

            const url = `/clientes?${queryParams.toString()}`;

            const response = await axiosInstance.get(url)

            setClientes(response.data.data);
            setTotalRegistros(response.data.total);
        } catch (err) {
            console.error('Error al obtener clientes:', err);
            setError('Error al cargar los clientes. Inténtelo de nuevo.');

        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        document.title = 'Listado de clientes - Admin';

        const currentSearchParams = {
            nombreCliente: filtroNombreCliente,
            tipoNegocio: filtroTipoNegocio,
            nombreNegocio: filtroNombreNegocio,
            cuit: filtroCuit,
            page: page,
            pageSize: rowsPerPage,
        };

        fetchClientes(currentSearchParams);
    }, [fetchClientes, page, rowsPerPage, triggerSearch]);

    // Manejadores de paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0); // Volver a la primera página cuando cambian los elementos por página
        fetchClientes({ page: 0, pageSize: newSize })
    };

    // Manejadores de filtros
    const handleApplyFilters = () => {
        setPage(0); // Resetear a la primera página al aplicar filtros
        setTriggerSearch(prev => prev + 1);
    };

    const handleClearFilters = () => {
        setFiltroNombreCliente('');
        setFiltroTipoNegocio('');
        setFiltroNombreNegocio('');
        setFiltroCuit('');
        setPage(0); // Resetear a la primera página
        fetchClientes({ page: 0 })
        setTriggerSearch(prev => prev + 1);
    };

    // Funciones de Acciones en la tabla
    const handleCopyData = (cliente) => {
        const dataToCopy = `Nombre del cliente: ${cliente.nombreCliente}, Tipo de Negocio: ${cliente.tipoNegocio}, Nombre del Negocio: ${cliente.nombreNegocio}, Cuit: ${cliente.cuit}`;
        navigator.clipboard.writeText(dataToCopy)
            .then(() => alert('Datos del cliente copiados al portapapeles'))
            .catch(err => console.error('Error al copiar:', err));
    };
    const handleCopyEmail = (email) => {
        if (email) {
            navigator.clipboard.writeText(email)
                .then(() => alert(`Correo copiado exitosamente \n${email}`))
                .catch(err => {
                    console.error('Error al copiar el correo:', err);
                });
        } 
    };

    const handleEditCliente = (id) => {
        navigate(`/admin/clientes/editar/${id}`);
    };

    const handleDeleteCliente = async (id) => {
        if (!window.confirm(`¿Está seguro que desea eliminar el cliente con ID: ${id}?`)) {
            return;
        }
        setLoading(true);
        try {
            const url = `${process.env.REACT_APP_API_BASE_URL}/cliente/${id}`;
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Cliente eliminado correctamente.');
            fetchClientes(); // Refrescar la lista
        } catch (err) {
            console.error('Error al eliminar cliente:', err);
            setError('Error al eliminar el cliente.');
        } finally {
            setLoading(false);
        }
    };

    // Funciones para los botones grandes
    const handleRegisterNewCliente = () => {
        navigate('/admin/clientes/nuevo');
    };

    const handleViewEventsHistory = () => {
        navigate('/admin/eventos');
    };


    if (loading && clientes.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                LISTA DE CLIENTES
            </Typography>

            {/* --- Sección de Botones Grandes --- */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" gutterBottom>Registrar nuevo Cliente</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleRegisterNewCliente}
                        >
                            Nuevo
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" gutterBottom>Exportar datos de Clientes</Typography>
                        <Button
                            variant="contained"
                            onClick={handleViewEventsHistory}
                        >
                            Descargar PDF
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* --- Sección de Filtros --- */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Filtros</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Nombre Responsable"
                            variant="outlined"
                            fullWidth
                            value={filtroNombreCliente}
                            onChange={(e) => setFiltroNombreCliente(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Tipo de Negocio"
                            variant="outlined"
                            fullWidth
                            value={filtroTipoNegocio}
                            onChange={(e) => setFiltroTipoNegocio(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Nombre de Negocio"
                            variant="outlined"
                            fullWidth
                            value={filtroNombreNegocio}
                            onChange={(e) => setFiltroNombreNegocio(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="CUIT"
                            variant="outlined"
                            fullWidth
                            value={filtroCuit}
                            onChange={(e) => setFiltroCuit(e.target.value)}
                            type="number"
                            size="small"
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

            {loading && clientes.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader aria-label="tabla de clientes">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CUIT</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Negocio</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Responsable</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Correo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Dirección del Negocio</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Acción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clientes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No se encontraron clientes con los filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    clientes.map((cliente) => (
                                        <TableRow hover key={cliente.id}>
                                            <TableCell>{cliente.cuit}</TableCell>
                                            <TableCell>{cliente.nombre_negocio}</TableCell>
                                            <TableCell>{cliente.tipo_negocio}</TableCell>
                                            <TableCell>{cliente.nombre_responsable}</TableCell>
                                            <TableCell>{cliente.telefono}</TableCell>
                                            <TableCell>
                                                {cliente.correo && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Link href={`mailto:${cliente.correo}`} target='_blank' rel='noopener noreferrer' sx={{ mr: 0.5 }}>
                                                            {cliente.correo}
                                                        </Link>
                                                        <IconButton
                                                            aria-label="copiar correo"
                                                            onClick={() => handleCopyEmail(cliente.correo)}
                                                            size="small"
                                                            sx={{ p: 0.5 }} 
                                                        >
                                                            <ContentCopyIcon fontSize="inherit" /> 
                                                        </IconButton>
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>{cliente.direccion}</TableCell>
                                            <TableCell align="right">
                                                <IconButton aria-label="copiar" onClick={() => handleCopyData(cliente)}>
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton aria-label="editar" onClick={() => handleEditCliente(cliente.id)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton aria-label="eliminar" onClick={() => handleDeleteCliente(cliente.id)}>
                                                    <DeleteIcon sx={{ color: '#ff443b'}} fontSize="small" />
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
                            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                        }
                    />
                </Paper>
            )}

            {/* --- Indicadores Inferiores --- */}
            <Grid container spacing={2} sx={{ mt: 4 }}>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" gutterBottom>Clientes activos</Typography>
                        {/* Lógica para obtener este número */}
                        <Typography variant="h3">4</Typography> {/* Valor hardcodeado por ahora */}
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" gutterBottom>Cliente con más Freezers</Typography>
                        {/* Lógica para obtener este número */}
                        <Typography variant="h3">Raúl Suarez</Typography> {/* Valor hardcodeado por ahora */}
                    </Paper>
                </Grid>
            </Grid>

        </Container>
    );
}

export default ClientesPage;

