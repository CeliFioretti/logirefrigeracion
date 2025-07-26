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
    Tooltip
} from '@mui/material';
import instanceAxios from '../../../api/axios';
import { UserContext } from '../../../context/UserContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Edit as EditIcon,
    LockReset as LockResetIcon,
    CheckCircle as CheckCircleIcon, // Nuevo icono para activar
    Block as BlockIcon,             // Nuevo icono para bloquear/inhabilitar
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

    // Estados para el diálogo de confirmación de cambio de estado
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [userToToggleId, setUserToToggleId] = useState(null);
    const [userToToggleName, setUserToToggleName] = useState('');
    const [userToToggleCurrentStatus, setUserToToggleCurrentStatus] = useState(null); // true for activo, false for inactivo


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

            const url = `/usuarios?${queryParams.toString()}`;
            
            const response = await instanceAxios.get(url)

            setUsuarios(response.data.data);
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
    }, [fetchAdministradores, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
    };

    const handleGoBack = () => {
        navigate('/admin-dashboard');
    }

    const handleSearch = () => {
        setPage(0);
        fetchAdministradores({ nombre: filtroNombre, page: 0, pageSize: rowsPerPage });
    };

    const handleClearSearch = () => {
        setFiltroNombre('');
        setPage(0);
        fetchAdministradores({ nombre: '', page: 0, pageSize: rowsPerPage });
    };

    // Función para manejar el clic en el botón de activar/inhabilitar
    const handleToggleUserStatusClick = (id, nombre, currentStatus) => {
        setUserToToggleId(id);
        setUserToToggleName(nombre);
        setUserToToggleCurrentStatus(currentStatus);
        setOpenStatusDialog(true);
    };

    // Función para confirmar el cambio de estado
    const handleConfirmToggleStatus = async () => {
        setOpenStatusDialog(false);
        if (!token || !userToToggleId) return;

        setLoading(true);
        setError(null);
        const newStatus = !userToToggleCurrentStatus; // Invertir el estado actual

        try {
            await instanceAxios.put(`/usuarios/${userToToggleId}/estado`,
                { activo: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            // Refrescar la lista después de actualizar el estado
            fetchAdministradores({ nombre: filtroNombre, page: page, pageSize: rowsPerPage });
            // Limpiar estados del diálogo
            setUserToToggleId(null);
            setUserToToggleName('');
            setUserToToggleCurrentStatus(null);
        } catch (err) {
            console.error('Error al cambiar el estado del usuario:', err);
            setError('Error al cambiar el estado del usuario. Inténtelo de nuevo.');
            setLoading(false);
        }
    };

    const handleCancelToggleStatus = () => {
        setOpenStatusDialog(false);
        setUserToToggleId(null);
        setUserToToggleName('');
        setUserToToggleCurrentStatus(null);
    };

    const handleEditClick = (userId) => {
        navigate(`/usuarios/editar/${userId}`);
    };

    const handleResetPasswordClick = (userId) => {
        navigate(`/usuarios/resetear-password/${userId}`);
    };


    if (loading && usuarios.length === 0 && !error) { 
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

                {usuarios.length === 0 && !loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Typography>No se encontraron administradores con los filtros aplicados.</Typography>
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
                                    {usuarios.map((usuarioItem) => (
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
                                                <Tooltip title="Editar Usuario"> 
                                                    <IconButton
                                                        aria-label="editar"
                                                        onClick={() => handleEditClick(usuarioItem.id)}
                                                        size="small"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Restablecer Contraseña"> 
                                                    <IconButton
                                                        aria-label="resetear contraseña"
                                                        onClick={() => handleResetPasswordClick(usuarioItem.id)}
                                                        size="small"
                                                    >
                                                        <LockResetIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={usuarioItem.activo ? 'Inhabilitar Usuario' : 'Activar Usuario'}> 
                                                    <IconButton
                                                        aria-label={usuarioItem.activo ? 'inhabilitar' : 'activar'}
                                                        onClick={() => handleToggleUserStatusClick(usuarioItem.id, usuarioItem.nombre, usuarioItem.activo)}
                                                        size="small"
                                                        color={usuarioItem.activo ? 'error' : 'success'}
                                                    >
                                                        {usuarioItem.activo ? <BlockIcon /> : <CheckCircleIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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

                {/* Diálogo de Confirmación de Cambio de Estado */}
                <Dialog
                    open={openStatusDialog}
                    onClose={handleCancelToggleStatus}
                    aria-labelledby="status-dialog-title"
                    aria-describedby="status-dialog-description"
                >
                    <DialogTitle id="status-dialog-title">
                        {userToToggleCurrentStatus ? "¿Inhabilitar Usuario?" : "¿Activar Usuario?"}
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            ¿Está seguro de que desea {userToToggleCurrentStatus ? 'inhabilitar' : 'activar'} al usuario " **{userToToggleName}** "?
                            Esta acción cambiará su estado de acceso al sistema.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelToggleStatus} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmToggleStatus} color={userToToggleCurrentStatus ? "error" : "success"} autoFocus>
                            {userToToggleCurrentStatus ? "Inhabilitar" : "Activar"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </LocalizationProvider>
    );
}

export default AdministradoresPage;