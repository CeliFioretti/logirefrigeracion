import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios'; 
import { UserContext } from '../../context/UserContext';

// Importaciones de Material-UI
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Alert,
    CircularProgress,
    FormControl,
    Grid,
    FormHelperText,
    Paper,
    Stack,
    Autocomplete,
    MenuItem,
    InputLabel,
    Select,
    IconButton,
    Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const RegistrarEvento = () => {
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);

    // Función auxiliar para formatear fechas para inputs datetime-local
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [formData, setFormData] = useState({
        freezer_id: '',
        cliente_id: '',
        fecha: formatDateForInput(new Date()), // Fecha y hora actual por defecto
        tipo: '',
        observaciones: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(true); // Para la carga inicial de freezers/clientes
    const [submitting, setSubmitting] = useState(false); // Para el envío del formulario
    const [error, setError] = useState(null);

    // Estados para Snackbar (mensajes de notificación)
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [allFreezers, setAllFreezers] = useState([]);
    const [filteredFreezers, setFilteredFreezers] = useState([]);
    const [allClientes, setAllClientes] = useState([]);

    const [selectedFreezer, setSelectedFreezer] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState(null);

    const tiposEvento = ["Entrega", "Retiro"];

    // Validar un campo individual
    const validateField = (name, value) => {
        let errorMsg = '';
        switch (name) {
            case 'tipo':
                if (!value) errorMsg = 'El tipo de evento es requerido.';
                break;
            case 'freezer_id':
                if (!value) errorMsg = 'El Freezer es requerido.';
                break;
            case 'cliente_id':
                if (!value) errorMsg = 'El Cliente es requerido.';
                break;
            case 'fecha':
                if (!value) {
                    errorMsg = 'La fecha y hora son requeridas.';
                } else {
                    const selectedDate = new Date(value);
                    const now = new Date();
                    // Permitir fechas pasadas, pero no futuras para creación
                    if (selectedDate > now) {
                        errorMsg = 'La fecha no puede ser en el futuro.';
                    }
                }
                break;
            default:
                break;
        }
        return errorMsg;
    };

    // Validar todo el formulario
    const validateForm = () => {
        let errors = {};
        let isValid = true;

        const fieldsToValidate = ['tipo', 'freezer_id', 'cliente_id', 'fecha'];
        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });

        setFormErrors(errors);
        return isValid;
    };

    // Efecto para cargar freezers y clientes
    useEffect(() => {
        const fetchData = async () => {
            if (!usuario?.token) {
                setError("No autorizado. Por favor, inicie sesión.");
                setLoading(false);
                return;
            }

            try {
                // Obtener todos los freezers y clientes
                const [freezersRes, clientesRes] = await Promise.all([
                    axios.get('/freezers', { headers: { Authorization: `Bearer ${usuario.token}` } }),
                    axios.get('/clientes', { headers: { Authorization: `Bearer ${usuario.token}` } })
                ]);

                setAllFreezers(freezersRes.data.data);
                setAllClientes(clientesRes.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar datos iniciales:", err.response ? err.response.data : err.message);
                setError("Error al cargar freezers y clientes. Verifique permisos o la conexión.");
                setLoading(false);
            }
        };

        fetchData();
    }, [usuario?.token]);

    // Efecto para filtrar freezers cuando cambia el tipo de evento
    useEffect(() => {
        if (formData.tipo === 'Entrega') {
            const disponibles = allFreezers.filter(f => f.estado === 'Disponible');
            setFilteredFreezers(disponibles);
            // Si el freezer actualmente seleccionado no es disponible, deseleccionarlo
            if (selectedFreezer && selectedFreezer.estado !== 'Disponible') {
                setSelectedFreezer(null);
                setFormData(prev => ({ ...prev, freezer_id: '' }));
            }
            // Para "Entrega", el cliente siempre debe poder seleccionarse
            // No necesitamos deseleccionar el cliente si ya está seleccionado
        } else if (formData.tipo === 'Retiro') {
            const asignados = allFreezers.filter(f => f.estado === 'Asignado');
            setFilteredFreezers(asignados);
            // Si el freezer actualmente seleccionado no es asignado, deseleccionarlo
            if (selectedFreezer && selectedFreezer.estado !== 'Asignado') {
                setSelectedFreezer(null);
                setFormData(prev => ({ ...prev, freezer_id: '' }));
            }
        } else {
            setFilteredFreezers([]); // Si no hay tipo seleccionado, no mostrar freezers
            setSelectedFreezer(null);
            setSelectedCliente(null);
            setFormData(prev => ({ ...prev, freezer_id: '', cliente_id: '' }));
        }
    }, [formData.tipo, allFreezers, selectedFreezer]); // Dependencia de selectedFreezer para re-evaluar si el freezer actual es válido

    // Manejo del cambio en los inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));
    };

    // Manejo del cambio en el Select de Tipo de Evento
    const handleTipoChange = (e) => {
        const { value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            tipo: value,
            freezer_id: '', // Limpiar freezer y cliente al cambiar el tipo
            cliente_id: ''
        }));
        setSelectedFreezer(null);
        setSelectedCliente(null);
        setFormErrors(prevErrors => ({
            ...prevErrors,
            tipo: '',
            freezer_id: '',
            cliente_id: ''
        }));
    };

    // Manejo del cambio en el Autocomplete de Freezer
    const handleFreezerChange = (event, newValue) => {
        setSelectedFreezer(newValue);
        setFormData(prevData => ({
            ...prevData,
            freezer_id: newValue ? String(newValue.id) : '',
        }));
        setFormErrors(prevErrors => ({
            ...prevErrors,
            freezer_id: ''
        }));

        // Lógica específica para tipo "Retiro": auto-rellenar cliente
        if (formData.tipo === 'Retiro' && newValue) {
            const clienteAsociado = allClientes.find(c => c.id === newValue.cliente_id);
            setSelectedCliente(clienteAsociado || null);
            setFormData(prevData => ({
                ...prevData,
                cliente_id: clienteAsociado ? String(clienteAsociado.id) : '',
            }));
        } else if (formData.tipo === 'Entrega') {
            // Si es entrega, asegura que el cliente no esté auto-seleccionado por error
            setSelectedCliente(null);
            setFormData(prevData => ({ ...prevData, cliente_id: '' }));
        }
    };

    // Manejo del cambio en el Autocomplete de Cliente
    const handleClienteChange = (event, newValue) => {
        setSelectedCliente(newValue);
        setFormData(prevData => ({
            ...prevData,
            cliente_id: newValue ? String(newValue.id) : '',
        }));
        setFormErrors(prevErrors => ({
            ...prevErrors,
            cliente_id: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); // Usar submitting para el spinner del botón
        setError(null);
        setSnackbarOpen(false); // Cerrar cualquier snackbar anterior

        const isValid = validateForm();
        if (!isValid) {
            setSubmitting(false);
            setError('Por favor, corrige los errores en el formulario.');
            setSnackbarMessage('Por favor, corrige los errores en el formulario.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        // Preparar la fecha y hora en el formato correcto para la base de datos (YYYY-MM-DD HH:MM:SS)
        const fechaDBFormat = new Date(formData.fecha).toISOString().slice(0, 19).replace('T', ' ');

        const dataToSend = {
            ...formData,
            freezer_id: Number(formData.freezer_id),
            cliente_id: Number(formData.cliente_id),
            fecha: fechaDBFormat,
            tipo: formData.tipo.toLowerCase(), // Asegurar que el tipo va en minúsculas al backend
            observaciones: formData.observaciones || null
        };

        try {
            await axios.post('/eventos-operador/registrar', dataToSend, {
                headers: { Authorization: `Bearer ${usuario.token}` }
            });

            setSnackbarMessage('Evento registrado correctamente.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Limpiar formulario para nueva entrada
            setFormData({
                freezer_id: '',
                cliente_id: '',
                fecha: formatDateForInput(new Date()),
                tipo: '',
                observaciones: '',
            });
            setSelectedFreezer(null);
            setSelectedCliente(null);
            setFormErrors({});

        } catch (err) {
            console.error("Error al registrar el evento:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Error al guardar el evento. Verifique los datos.');
            setSnackbarMessage(err.response?.data?.message || 'Error al guardar el evento. Verifique los datos.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    // Determinando el estado de disabled para los campos
    const isFreezerDisabled = !formData.tipo;
    const isClienteDisabled = !formData.tipo || (formData.tipo === 'Retiro' && selectedFreezer);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
                <Typography variant="h6" align="center">Cargando datos...</Typography>
            </Container>
        );
    }

    if (!usuario?.token) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">No autorizado. Por favor, inicie sesión para registrar eventos.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={() => navigate('/operador-menu')} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h2" align="center" sx={{ flexGrow: 1 }}>
                        REGISTRAR NUEVO EVENTO
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Grid container spacing={0} direction="column">
                        {/* Campo Tipo de Evento */}
                        <Grid item xs={12}>
                            <FormControl fullWidth required error={!!formErrors.tipo} sx={{ mb: 3 }}>
                                <InputLabel id="tipo-label">Tipo de Evento</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    id="tipo"
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleTipoChange}
                                    label="Tipo de Evento"
                                >
                                    <MenuItem value="">Seleccione un tipo</MenuItem>
                                    {tiposEvento.map(tipo => (
                                        <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                    ))}
                                </Select>
                                {formErrors.tipo && <FormHelperText>{formErrors.tipo}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        {/* Campo Freezer */}
                        <Grid item xs={12}>
                            <Autocomplete
                                id="freezer_id-autocomplete"
                                options={filteredFreezers}
                                getOptionLabel={(option) => `ID: ${option.id} - Modelo: ${option.modelo} - Serie: ${option.numero_serie} (Estado: ${option.estado})`}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={handleFreezerChange}
                                value={selectedFreezer}
                                disabled={isFreezerDisabled}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Freezer"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={!!formErrors.freezer_id}
                                        helperText={formErrors.freezer_id}
                                        sx={{ mb: 3 }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Campo Cliente */}
                        <Grid item xs={12}>
                            <Autocomplete
                                id="cliente_id-autocomplete"
                                options={allClientes}
                                getOptionLabel={(option) => `ID: ${option.id} - Nombre: ${option.nombre_responsable}`}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={handleClienteChange}
                                value={selectedCliente}
                                disabled={isClienteDisabled}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Cliente"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={!!formErrors.cliente_id}
                                        helperText={formErrors.cliente_id}
                                        sx={{ mb: 3 }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Campo Fecha y Hora */}
                        <Grid item xs={12}>
                            <TextField
                                label="Fecha y Hora del Evento"
                                type="datetime-local"
                                variant="outlined"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                error={!!formErrors.fecha}
                                helperText={formErrors.fecha}
                                sx={{ mb: 3 }}
                            />
                        </Grid>

                        {/* Campo Observaciones */}
                        <Grid item xs={12}>
                            <TextField
                                label="Observaciones (Opcional)"
                                variant="outlined"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={3}
                                sx={{ mb: 3 }}
                            />
                        </Grid>
                    </Grid>

                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/operador-menu')} // Volver al menú del operador
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitting}
                            startIcon={submitting && <CircularProgress size={20} color="inherit" />}
                        >
                            {submitting ? 'Registrando...' : 'Registrar Evento'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RegistrarEvento;
