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
    Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

function DepartamentosPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    const [departamentos, setDepartamentos] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtroNombre, setFiltroNombre] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [triggerSearch, setTriggerSearch] = useState(0);

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

            const url = `http://localhost:3200/api/ubicaciones?${queryParams.toString()}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

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
        alert('Funcionalidad para crear departamento (a implementar).');
    };

    if (loading && departamentos.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                LISTA DE DEPARTAMENTOS
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
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
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Nombre del Departamento"
                            variant="outlined"
                            fullWidth
                            value={filtroNombre}
                            onChange={(e) => setFiltroNombre(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
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

            {loading && departamentos.length === 0 ? (
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
    );
}

export default DepartamentosPage;