// src/pages/Ubicaciones/DepartamentosPage.jsx
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
    IconButton,
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Visibility as VisibilityIcon, // Icono para ver zonas
    Add as AddIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import axiosInstance from '../../api/axios'
import { UserContext } from '../../context/UserContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import CreateDepartamentoForm from '../../components/CrearDepartamentoForm';
import EditDepartamentoForm from '../../components/EditarDepartamento';

function DepartamentosPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    const [departamentos, setDepartamentos] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros y paginación
    const [filtroNombre, setFiltroNombre] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [triggerSearch, setTriggerSearch] = useState(0);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false); 
    const [departamentoToEdit, setDepartamentoToEdit] = useState(null); 


    const fetchDepartamentos = useCallback(async (searchParams) => {
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (searchParams.nombre) queryParams.append('nombre', searchParams.nombre);
            queryParams.append('page', searchParams.page);
            queryParams.append('pageSize', searchParams.pageSize);

            const url = `/ubicaciones?${queryParams.toString()}`;

            const response = await axiosInstance.get(url)

            setDepartamentos(response.data.data);
            setTotalRegistros(response.data.total);
        } catch (err) {
            console.error('Error al obtener departamentos:', err);
            setError('Error al cargar los departamentos. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        document.title = 'Listado de Departamentos - Admin';
        const currentSearchParams = {
            nombre: filtroNombre,
            page: page,
            pageSize: rowsPerPage,
        };
        fetchDepartamentos(currentSearchParams);
    }, [fetchDepartamentos, page, rowsPerPage, triggerSearch]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleGoBack = () => {
        navigate('/admin-dashboard');
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
    };

    const handleApplyFilters = () => {
        setPage(0);
        setTriggerSearch(prev => prev + 1);
    };

    const handleClearFilters = () => {
        setFiltroNombre('');
        setPage(0);
        setRowsPerPage(10);
        setTriggerSearch(prev => prev + 1);
    };

    const handleViewZonas = (departamentoId) => {
        navigate(`/ubicaciones/${departamentoId}/zonas`);
    };

    const handleCreateDepartamento = () => {
        setOpenCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setOpenCreateModal(false); 
    };

    const handleDepartamentoCreated = () => {
        setTriggerSearch(prev => prev + 1); 
    };

    const handleEditDepartamento = (departamento) => {
        setDepartamentoToEdit(departamento); 
        setOpenEditModal(true); 
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false); 
        setDepartamentoToEdit(null);
    };

    const handleDepartamentoUpdated = () => {
        setTriggerSearch(prev => prev + 1); 
    };

    if (loading && departamentos.length === 0) {
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
                    LISTA DE DEPARTAMENTOS
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Registrar Departamento</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateDepartamento}
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
                                label="Nombre del Departamento"
                                variant="outlined"
                                fullWidth
                                value={filtroNombre}
                                onChange={(e) => setFiltroNombre(e.target.value)}
                                size="small"
                            />
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

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading && departamentos.length === 0 && !error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader aria-label="tabla de departamentos">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {departamentos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                No se encontraron departamentos.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        departamentos.map((departamento) => (
                                            <TableRow hover key={departamento.id}>
                                                <TableCell>{departamento.id}</TableCell>
                                                <TableCell>{departamento.nombre}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        aria-label="editar departamento"
                                                        onClick={() => handleEditDepartamento(departamento)}
                                                        color="info"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        aria-label="ver zonas"
                                                        onClick={() => handleViewZonas(departamento.id)}
                                                        color="primary"
                                                    >
                                                        <VisibilityIcon fontSize="small" />
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
            </Container>

            {/* Modal para crear departamento */}
            <CreateDepartamentoForm
                open={openCreateModal}
                handleClose={handleCloseCreateModal}
                onDepartamentoCreated={handleDepartamentoCreated}
            />

            {/* Modal para editar departamento */}
            {departamentoToEdit && (
                <EditDepartamentoForm
                    open={openEditModal}
                    handleClose={handleCloseEditModal}
                    onDepartamentoUpdated={handleDepartamentoUpdated}
                    departamento={departamentoToEdit}
                />
            )}
        </LocalizationProvider>
    );
}

export default DepartamentosPage;