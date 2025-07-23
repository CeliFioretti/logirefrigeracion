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
    Paper,
    TextField,
    Button,
    Grid,
    IconButton,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import axiosInstance from '../../api/axios'
import { UserContext } from '../../context/UserContext';
import { useNavigate, useParams } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import CreateZonaForm from '../../components/CrearZonaForm';
import EditZonaForm from '../../components/EditarZonaForm';

function ZonasPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();
    const { departamentoId } = useParams();

    const [zonas, setZonas] = useState([]);
    const [departamentoNombre, setDepartamentoNombre] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros específicos para zonas
    const [filtroNombreZona, setFiltroNombreZona] = useState('');
    const [filtroNombreOperador, setFiltroNombreOperador] = useState('');

    const [triggerSearch, setTriggerSearch] = useState(0); // Para re-ejecutar búsquedas/filtros

    const [openCreateZonaModal, setOpenCreateZonaModal] = useState(false);
    const [openEditZonaModal, setOpenEditZonaModal] = useState(false);
    const [zonaToEdit, setZonaToEdit] = useState(null); 

    // Función para obtener el nombre del departamento
    const fetchDepartamentoNombre = useCallback(async () => {
        if (!token || !departamentoId) return;
        try {
            const url = `/ubicaciones/${departamentoId}`
            const response = await axiosInstance.get(url)
            setDepartamentoNombre(response.data.nombre); // Guarda el nombre del departamento
        } catch (err) {
            console.error('Error al obtener nombre del departamento:', err);
            setDepartamentoNombre('Departamento no encontrado');
            setError('No se pudo cargar la información del departamento.');
        }
    }, [token, departamentoId]);

    // Función para obtener las zonas del departamento
    const fetchZonas = useCallback(async (searchParams) => {
        if (!token || !departamentoId) {
            setError('No autenticado o ID de departamento no proporcionado.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (searchParams.nombreZona) queryParams.append('nombre', searchParams.nombreZona);
            if (searchParams.nombreOperador) queryParams.append('operador', searchParams.nombreOperador);

            const url = `/ubicaciones/${departamentoId}/zonas?${queryParams.toString()}`;

            const response = await axiosInstance.get(url)

            setZonas(response.data.data);

        } catch (err) {
            console.error('Error al obtener zonas:', err);
            setError('Error al cargar las zonas. Inténtelo de nuevo.');
            setZonas([]); // Limpiar zonas en caso de error
        } finally {
            setLoading(false);
        }
    }, [token, departamentoId]);

    // Efecto para cargar datos al inicio y cuando cambian filtros o paginación
    useEffect(() => {
        document.title = `Zonas de ${departamentoNombre || 'Cargando...'} - Admin`;

        fetchDepartamentoNombre();

        const currentSearchParams = {
            nombreZona: filtroNombreZona,
            nombreOperador: filtroNombreOperador
        };
        fetchZonas(currentSearchParams);
    }, [fetchZonas, fetchDepartamentoNombre, triggerSearch, departamentoNombre]);


    const handleGoBack = () => {
        navigate('/ubicaciones/departamentos/listado');
    };

    const handleApplyFilters = () => {
        setTriggerSearch(prev => prev + 1); // Disparar useEffect para re-fetch
    };

    const handleClearFilters = () => {
        setFiltroNombreZona('');
        setFiltroNombreOperador('');
        setTriggerSearch(prev => prev + 1);
    };

    const handleEditZona = (zona) => {
        setZonaToEdit(zona);
        setOpenEditZonaModal(true);
    };

    const handleCloseEditZonaModal = () => {
        setOpenEditZonaModal(false);
        setZonaToEdit(null); // Limpiar la zona a editar al cerrar
    };

    const handleZonaUpdated = () => {
        setTriggerSearch(prev => prev + 1); // Refrescar la lista
    };

    const handleDeleteZona = async (zonaId) => {
        if (!window.confirm(`¿Está seguro que desea eliminar la zona con ID: ${zonaId}?`)) {
            return; // Cancelar si el usuario no confirma
        }
        setLoading(true);
        try {
            const url = `/ubicaciones/zonas/${zonaId}`;
            await axiosInstance.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Zona eliminada correctamente.');
            setTriggerSearch(prev => prev + 1); // Refrescar la lista de zonas después de eliminar
        } catch (err) {
            console.error('Error al eliminar zona:', err);
            setError(err.response?.data?.error || 'Error al eliminar la zona. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateZona = () => {
        setOpenCreateZonaModal(true);
    };

    const handleCloseCreateZonaModal = () => {
        setOpenCreateZonaModal(false);
    };

    const handleZonaCreated = () => {
        setTriggerSearch(prev => prev + 1); // Refrescar la lista
    };


    if (loading && zonas.length === 0 && !error) {
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        ZONAS DE: {departamentoNombre}
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid> 
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Registrar Zona</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateZona} 
                            >
                                Nueva
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Filtros</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid>
                            <TextField
                                label="Nombre de la Zona"
                                variant="outlined"
                                fullWidth
                                value={filtroNombreZona}
                                onChange={(e) => setFiltroNombreZona(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                label="Nombre del Operador"
                                variant="outlined"
                                fullWidth
                                value={filtroNombreOperador}
                                onChange={(e) => setFiltroNombreOperador(e.target.value)}
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

                {loading && zonas.length === 0 && !error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader aria-label="tabla de zonas">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Nombre de Zona</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Operador Asignado</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {zonas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No se encontraron zonas para este departamento.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        
                                        zonas.map((zona) => ( 
                                            <TableRow hover key={zona.id}>
                                                <TableCell>{zona.id}</TableCell>
                                                <TableCell>{zona.zona}</TableCell>
                                                <TableCell>{zona.operador || ''}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        aria-label="editar"
                                                        onClick={() => handleEditZona(zona)}
                                                        color="info"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        aria-label="eliminar"
                                                        onClick={() => handleDeleteZona(zona.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Container>

            <CreateZonaForm
                open={openCreateZonaModal}
                handleClose={handleCloseCreateZonaModal}
                onZonaCreated={handleZonaCreated}
                departamentoId={departamentoId}
                departamentoNombre={departamentoNombre}
            />

            {zonaToEdit && (
                <EditZonaForm
                    open={openEditZonaModal}
                    handleClose={handleCloseEditZonaModal}
                    onZonaUpdated={handleZonaUpdated}
                    zona={zonaToEdit}
                    departamentoId={departamentoId} 
                />
            )}
        </LocalizationProvider>
    );
}

export default ZonasPage;