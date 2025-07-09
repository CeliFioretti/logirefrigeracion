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
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import axios from 'axios';
import { UserContext } from '../../../context/UserContext';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LockReset as LockResetIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function AdministradoresPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    const [usuarios, setUsuarios] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtroNombre, setFiltroNombre] = useState('');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [userNameToDelete, setUserNameToDelete] = useState('');

    const fetchAdministradores = useCallback(async (searchParams) => {
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
            queryParams.append('rol', 'administrador'); // Filtrar solo administradores
            queryParams.append('page', searchParams.page);
            queryParams.append('pageSize', searchParams.pageSize);

            const url = `http://localhost:3200/api/usuarios?${queryParams.toString()}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setUsuarios(response.data.data)
            setTotalRegistros(response.data.total);

        } catch (err) {
            console.error('Error al obtener administradores:', err);
            setError('Error al cargar los administradores. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        document.title = 'Gestión de Administradores - Admin';

        const currentSearchParams = {
            nombre: filtroNombre,
            page: page,
            pageSize: rowsPerPage,
        };

        fetchAdministradores(currentSearchParams);
    }, [fetchAdministradores, page, rowsPerPage]); // Eliminar triggerSearch, ya que no hay un botón explícito de aplicar filtros para esto

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
    };

    const handleSearch = () => {
        setPage(0);
        fetchAdministradores({ nombre: filtroNombre, page: 0, pageSize: rowsPerPage });
    };

    const handleClearSearch = () => {
        setFiltroNombre('');
        setPage(0);
        fetchAdministradores({ nombre: '', page: 0, pageSize: rowsPerPage });
    };

    const handleDeleteClick = (id, nombre) => {
        setUserIdToDelete(id);
        setUserNameToDelete(nombre);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        setOpenDeleteDialog(false);
        if (!token || !userIdToDelete) return;

        try {
            setLoading(true);
            await axios.delete(`http://localhost:3200/api/usuarios/${userIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserIdToDelete(null);
            setUserNameToDelete('');
            // Refrescar la lista después de eliminar
            fetchAdministradores({ nombre: filtroNombre, page: page, pageSize: rowsPerPage });
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            setError('Error al eliminar el usuario. Inténtelo de nuevo.');
            setLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setUserIdToDelete(null);
        setUserNameToDelete('');
    };

    const handleEditClick = (userId) => {
        navigate(`/usuarios/editar/${userId}`);
    };

    const handleResetPasswordClick = (userId) => {
        navigate(`/usuarios/resetear-password/${userId}`);
    };


    if (loading && usuarios.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                ADMINISTRADORES
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Buscar por Nombre"
                            variant="outlined"
                            fullWidth
                            value={filtroNombre}
                            onChange={(e) => setFiltroNombre(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={8}>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            sx={{ mr: 1 }}
                        >
                            Buscar
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearSearch}
                        >
                            Limpiar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && usuarios.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader aria-label="tabla de administradores">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Correo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Acción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usuarios.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No se encontraron administradores con los filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usuarios.map((usuarioItem) => (
                                        <TableRow hover key={usuarioItem.id}>
                                            <TableCell>{usuarioItem.nombre}</TableCell>
                                            <TableCell>{usuarioItem.correo}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={usuarioItem.activo ? 'Activo' : 'Inactivo'}
                                                    color={usuarioItem.activo ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    aria-label="editar"
                                                    onClick={() => handleEditClick(usuarioItem.id)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="resetear contraseña"
                                                    onClick={() => handleResetPasswordClick(usuarioItem.id)}
                                                    size="small"
                                                >
                                                    <LockResetIcon />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="eliminar"
                                                    onClick={() => handleDeleteClick(usuarioItem.id, usuarioItem.nombre)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
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

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirmar Eliminación"}</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro de que desea eliminar al administrador " **{userNameToDelete}** "?
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default AdministradoresPage;