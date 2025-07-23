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
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import axiosInstance from '../../../api/axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { UserContext } from '../../../context/UserContext';
import {
    Delete as DeleteIcon,
    ContentCopy as ContentCopyIcon,
    Add as AddIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    HighlightOff as HighlightOffIcon,
    CalendarToday as CalendarTodayIcon,
    MailOutline as MailOutlineIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

function CodigosPage() {
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;
    const navigate = useNavigate();

    const [codigos, setCodigos] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [newCodigoRol, setNewCodigoRol] = useState('operador');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [triggerSearch, setTriggerSearch] = useState(0);

    // Estados para el modal de envío de correo
    const [openSendEmailDialog, setOpenSendEmailDialog] = useState(false);
    const [emailToSendTo, setEmailToSendTo] = useState('');
    const [currentCodigoEmail, setCurrentCodigoEmail] = useState(null); // Almacena el código actual para enviar
    const [currentRolEmail, setCurrentRolEmail] = useState(null);     // Almacena el rol actual para enviar

    const fetchCodigos = useCallback(async () => {
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const queryParams = new URLSearchParams({
                page: page,
                pageSize: rowsPerPage,
            });

            const url = `/codigos-registro?${queryParams.toString()}`;

            const response = await axiosInstance.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCodigos(Array.isArray(response.data.data) ? response.data.data : []);
            setTotalRegistros(response.data.total || 0);

        } catch (err) {
            console.error('Error al obtener códigos:', err);
            setError(err.response?.data?.message || 'Error al cargar los códigos. Inténtelo de nuevo.');
            setCodigos([]);
            setTotalRegistros(0);
        } finally {
            setLoading(false);
        }
    }, [token, page, rowsPerPage]);

    useEffect(() => {
        document.title = 'Gestión de Códigos de Registro - Admin';
        fetchCodigos();
    }, [fetchCodigos, triggerSearch]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
    };

    const handleCopyCode = (codigo) => {
        navigator.clipboard.writeText(codigo)
            .then(() => setSuccessMessage(`Código "${codigo}" copiado al portapapeles.`))
            .catch(err => {
                console.error('Error al copiar el código:', err);
                setError('Error al copiar el código.');
            });
    };

    // Abre el modal para pedir el correo
    const handleOpenSendEmailDialog = (codigo, rol) => {
        setCurrentCodigoEmail(codigo);
        setCurrentRolEmail(rol);
        setEmailToSendTo(''); // Limpiar el input cada vez que se abre
        setOpenSendEmailDialog(true);
    };

    const handleCloseSendEmailDialog = () => {
        setOpenSendEmailDialog(false);
        setCurrentCodigoEmail(null);
        setCurrentRolEmail(null);
        setEmailToSendTo('');
    };

    // Función que envía la solicitud al backend para enviar el correo
    const handleSendEmailThroughBackend = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!emailToSendTo || !currentCodigoEmail || !currentRolEmail) {
            setError('Faltan datos para enviar el correo.');
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post('/codigos-registro/enviar-email', {
                para: emailToSendTo,
                codigo: currentCodigoEmail,
                rol: currentRolEmail
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccessMessage(response.data.message || `Código enviado a ${emailToSendTo} correctamente.`);
            handleCloseSendEmailDialog();
        } catch (err) {
            console.error('Error al enviar el correo:', err);
            setError(err.response?.data?.message || 'Error al enviar el correo. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteCodigo = async (id) => {
        if (!window.confirm(`¿Está seguro que desea eliminar el código con ID: ${id}?`)) {
            return;
        }
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const url = `/codigos-registro/${id}`;
            const response = await axiosInstance.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccessMessage(response.data.message || 'Código eliminado correctamente.');
            setTriggerSearch(prev => prev + 1);
        } catch (err) {
            console.error('Error al eliminar código:', err);
            setError(err.response?.data?.error || 'Error al eliminar el código.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewCodigo = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await axiosInstance.post('/codigos-registro', { rol: newCodigoRol }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccessMessage(`Nuevo código para ${newCodigoRol} generado: ${response.data.codigo}`);
            setNewCodigoRol('operador');
            setTriggerSearch(prev => prev + 1);
        } catch (err) {
            console.error('Error al crear código:', err);
            setError(err.response?.data?.error || 'Error al crear el código.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/admin-dashboard');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Mendoza' };
        return date.toLocaleDateString('es-AR', options);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handleGoBack} aria-label="Volver">
                    <ArrowBackIcon fontSize='large' />
                </IconButton>
            </Box>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    GESTIÓN DE CÓDIGOS DE REGISTRO
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid> 
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Generar Nuevo Código</Typography>
                            <TextField
                                select
                                label="Rol para el Código"
                                value={newCodigoRol}
                                onChange={(e) => setNewCodigoRol(e.target.value)}
                                fullWidth
                                size="small"
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="operador">Operador</MenuItem>
                            </TextField>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateNewCodigo}
                                disabled={loading}
                            >
                                Generar Código
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                {loading && codigos.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader aria-label="tabla de códigos de registro">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Creación</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Expiración</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {codigos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No se encontraron códigos de registro.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        codigos.map((codigo) => {
                                            const now = new Date();
                                            const expirationDate = new Date(codigo.fecha_expiracion);

                                            const isUsed = codigo.usado === 1;
                                            const isExpiredAndUnused = !isUsed && expirationDate < now;
                                            const isUsable = !isUsed && expirationDate >= now;

                                            return (
                                                <TableRow hover key={codigo.id}>
                                                    <TableCell>{codigo.id}</TableCell>
                                                    <TableCell>{codigo.codigo}</TableCell>
                                                    <TableCell>{codigo.rol}</TableCell>
                                                    <TableCell>
                                                        {isUsed && (
                                                            <Tooltip title="Usado">
                                                                <HighlightOffIcon color="error" />
                                                            </Tooltip>
                                                        )}
                                                        {isExpiredAndUnused && (
                                                            <Tooltip title="Expirado">
                                                                <CalendarTodayIcon color="error" sx={{ ml: isUsed ? 1 : 0 }} />
                                                            </Tooltip>
                                                        )}
                                                        {isUsable && (
                                                            <Tooltip title="Usable (Activo)">
                                                                <CheckCircleOutlineIcon color="success" />
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{formatDate(codigo.fecha_creacion)}</TableCell>
                                                    <TableCell>{formatDate(codigo.fecha_expiracion)}</TableCell>
                                                    <TableCell align="center">
                                                        {isUsable && (
                                                            <Tooltip title="Enviar código por email">
                                                                <IconButton
                                                                    aria-label="enviar por email"
                                                                    onClick={() => handleOpenSendEmailDialog(codigo.codigo, codigo.rol)}
                                                                >
                                                                    <MailOutlineIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip title="Copiar código">
                                                            <IconButton aria-label="copiar código" onClick={() => handleCopyCode(codigo.codigo)}>
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar código">
                                                            <IconButton aria-label="eliminar" onClick={() => handleDeleteCodigo(codigo.id)} sx={{ color: '#ff443b' }}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
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
                <Grid container spacing={2} sx={{ mt: 4 }}>
                    <Grid>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Códigos Activos</Typography>
                            <Typography variant="h3">
                                {codigos.filter(c => c.usado === 0 && new Date(c.fecha_expiracion) > new Date()).length}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid> 
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Códigos Usados</Typography>
                            <Typography variant="h3">
                                {codigos.filter(c => c.usado === 1).length}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid> 
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Códigos Expirados (sin usar)</Typography>
                            <Typography variant="h3">
                                {codigos.filter(c => c.usado === 0 && new Date(c.fecha_expiracion) < new Date()).length}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

            </Container>

            {/* Diálogo para enviar correo */}
            <Dialog open={openSendEmailDialog} onClose={handleCloseSendEmailDialog}>
                <DialogTitle>Enviar Código por Correo</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Ingresa el correo electronico al que deseas enviar el código de registro:
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Correo Electrónico"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={emailToSendTo}
                        onChange={(e) => setEmailToSendTo(e.target.value)}
                        error={!!error && error.includes('correo')}
                        helperText={!!error && error.includes('correo') ? error : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSendEmailDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSendEmailThroughBackend}
                        color="primary"
                        disabled={loading || !emailToSendTo || !currentCodigoEmail || !currentRolEmail}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Enviar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}

export default CodigosPage;