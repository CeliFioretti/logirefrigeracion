import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { UserContext } from '../context/UserContext';

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
    Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

const AsignacionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);

    const tiposMantenimiento = ["Preventivo", "Correctivo", "Inspección"]; // Tipos de mantenimiento para la asignación

    const formatDateForInput = (date) => {
        if (!date) return null;
        const d = new Date(date);
        // Formato YYYY-MM-DD para input type="date"
        return format(d, 'yyyy-MM-dd');
    };

    const [formData, setFormData] = useState({
        usuario_id: '',
        freezer_id: '',
        fecha_asignacion: formatDateForInput(new Date()), // Fecha actual por defecto
        observaciones: '',
        // Inicializa con el primer tipo de mantenimiento si existe, de lo contrario, cadena vacía.
        // La validación se encargará de que no se envíe vacío si no hay tipos.
        tipo_mantenimiento_asignado: tiposMantenimiento.length > 0 ? tiposMantenimiento[0] : ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [operadores, setOperadores] = useState([]); // Para la lista de operadores
    const [freezers, setFreezers] = useState([]); // Para la lista de freezers
    const [selectedOperador, setSelectedOperador] = useState(null);
    const [selectedFreezer, setSelectedFreezer] = useState(null);


    // Función de validación de campo individual
    const validateField = (name, value) => {
        let errorMsg = '';
        switch (name) {
            case 'usuario_id':
                if (!value) {
                    errorMsg = 'El Operador es requerido.';
                }
                break;
            case 'freezer_id':
                if (!value) {
                    errorMsg = 'El Freezer es requerido.';
                }
                break;
            case 'fecha_asignacion':
                if (!value) {
                    errorMsg = 'La fecha de asignación es requerida.';
                } else {
                    const selectedDate = new Date(value);
                    const now = new Date();
                    // Permitir fechas futuras o la fecha actual
                    if (selectedDate.setHours(0,0,0,0) < now.setHours(0,0,0,0)) {
                        errorMsg = 'La fecha de asignación no puede ser en el pasado.';
                    }
                }
                break;
            case 'tipo_mantenimiento_asignado':
                if (!value) {
                    errorMsg = 'El tipo de mantenimiento asignado es requerido.';
                }
                break;
            default:
                break;
        }
        return errorMsg;
    };

    // Función de validación de todo el formulario
    const validateForm = () => {
        let errors = {};
        let isValid = true;

        const fieldsToValidate = ['usuario_id', 'freezer_id', 'fecha_asignacion', 'tipo_mantenimiento_asignado'];
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

    useEffect(() => {
        const fetchData = async () => {
            if (usuario?.token) {
                try {
                    // Cargar operadores (solo rol 'operador')
                    const operadoresResponse = await axiosInstance.get('/usuarios?rol=operador', {
                        headers: { Authorization: `Bearer ${usuario.token}` }
                    });
                    setOperadores(operadoresResponse.data.data);

                    // Cargar freezers
                    const freezersResponse = await axiosInstance.get('/freezers', {
                        headers: { Authorization: `Bearer ${usuario.token}` }
                    });
                    setFreezers(freezersResponse.data.data);

                    if (id) {
                        setIsEditing(true);
                        document.title = 'Editar Asignación de Mantenimiento - Admin';
                        const asignacionResponse = await axiosInstance.get(`/asignaciones-mantenimiento/${id}`, {
                            headers: { Authorization: `Bearer ${usuario.token}` }
                        });
                        const asignacionData = asignacionResponse.data.data;

                        setFormData({
                            usuario_id: String(asignacionData.usuario_id),
                            freezer_id: String(asignacionData.freezer_id),
                            fecha_asignacion: formatDateForInput(asignacionData.fecha_asignacion),
                            observaciones: asignacionData.asignacion_observaciones || '',
                            tipo_mantenimiento_asignado: asignacionData.tipo_asignacion || (tiposMantenimiento.length > 0 ? tiposMantenimiento[0] : '')
                        });

                        // Pre-seleccionar operador y freezer en los Autocomplete
                        const foundOperador = operadoresResponse.data.data.find(
                            (op) => op.id === asignacionData.usuario_id
                        );
                        setSelectedOperador(foundOperador || null);

                        const foundFreezer = freezersResponse.data.data.find(
                            (f) => f.id === asignacionData.freezer_id
                        );
                        setSelectedFreezer(foundFreezer || null);

                    } else {
                        setIsEditing(false);
                        document.title = 'Nueva Asignación de Mantenimiento - Admin';
                        setFormData(prevData => ({
                            ...prevData,
                            fecha_asignacion: formatDateForInput(new Date()),
                            tipo_mantenimiento_asignado: tiposMantenimiento.length > 0 ? tiposMantenimiento[0] : '' // Asegura valor por defecto para nuevos
                        }));
                    }
                    setLoading(false);
                } catch (err) {
                    console.error("Error al cargar datos:", err.response ? err.response.data : err.message);
                    setError("Error al cargar los datos necesarios. Verifique permisos o la conexión.");
                    setLoading(false);
                }
            } else {
                setError("No autorizado. Por favor, inicie sesión.");
                setLoading(false);
            }
        };

        fetchData();
    }, [id, usuario?.token]);


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

    const handleOperadorChange = (event, newValue) => {
        setSelectedOperador(newValue);
        setFormData(prevData => ({
            ...prevData,
            usuario_id: newValue ? String(newValue.id) : '',
        }));
        setFormErrors(prevErrors => ({
            ...prevErrors,
            usuario_id: ''
        }));
    };

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
    };

    const handleDateChange = (date) => {
        setFormData(prevData => ({
            ...prevData,
            fecha_asignacion: formatDateForInput(date)
        }));
        setFormErrors(prevErrors => ({
            ...prevErrors,
            fecha_asignacion: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const isValid = validateForm();
        if (!isValid) {
            setLoading(false);
            setError('Por favor, corrige los errores en el formulario.');
            return;
        }

        const dataToSend = {
            usuario_id: Number(formData.usuario_id),
            freezer_id: Number(formData.freezer_id),
            fecha_asignacion: formData.fecha_asignacion, // Ya está en formato 'YYYY-MM-DD'
            observaciones: formData.observaciones || null,
            tipo_mantenimiento_asignado: formData.tipo_mantenimiento_asignado
        };

        try {
            if (isEditing) {
                await axiosInstance.put(`/asignaciones-mantenimiento/${id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${usuario.token}` }
                });
                setSuccessMessage('Asignación actualizada correctamente.');
            } else {
                await axiosInstance.post('/asignaciones-mantenimiento', dataToSend, {
                    headers: { Authorization: `Bearer ${usuario.token}` }
                });
                setSuccessMessage('Asignación registrada correctamente.');
                // Limpiar formulario para nueva entrada
                setFormData({
                    usuario_id: '',
                    freezer_id: '',
                    fecha_asignacion: formatDateForInput(new Date()),
                    observaciones: '',
                    tipo_mantenimiento_asignado: tiposMantenimiento.length > 0 ? tiposMantenimiento[0] : '' // Reinicia con valor por defecto
                });
                setSelectedOperador(null);
                setSelectedFreezer(null);
                setFormErrors({});
            }
        } catch (err) {
            console.error("Error al enviar el formulario:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Error al guardar la asignación. Verifique los datos.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && (isEditing || (!isEditing && operadores.length === 0 && freezers.length === 0))) {
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
                <Alert severity="error">No autorizado. Por favor, inicie sesión para {isEditing ? 'editar' : 'registrar'} asignaciones.</Alert>
            </Container>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton onClick={() => navigate('/admin/asignaciones')} aria-label="Volver">
                            <ArrowBackIcon fontSize='large' />
                        </IconButton>
                        <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ flexGrow: 1 }}>
                            {isEditing ? 'EDITAR ASIGNACIÓN DE MANTENIMIENTO' : 'CREAR NUEVA ASIGNACIÓN DE MANTENIMIENTO'}
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Cambiado a direction="column" para apilar elementos */}
                        <Grid container spacing={2} direction="column">
                            {/* Eliminado md={6} para que cada elemento ocupe todo el ancho */}
                            <Grid item xs={12}>
                                <Autocomplete
                                    id="operador-autocomplete"
                                    options={operadores}
                                    getOptionLabel={(option) => `${option.nombre} (ID: ${option.id})`}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={handleOperadorChange}
                                    value={selectedOperador}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Operador"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            error={!!formErrors.usuario_id}
                                            helperText={formErrors.usuario_id}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    id="freezer-autocomplete"
                                    options={freezers}
                                    getOptionLabel={(option) => `Serie: ${option.numero_serie} - Modelo: ${option.modelo}`}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={handleFreezerChange}
                                    value={selectedFreezer}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Freezer"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            error={!!formErrors.freezer_id}
                                            helperText={formErrors.freezer_id}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <DatePicker
                                    label="Fecha de Asignación"
                                    value={formData.fecha_asignacion ? new Date(formData.fecha_asignacion) : null}
                                    onChange={handleDateChange}
                                    format='dd/MM/yyyy'
                                    slotProps={{ textField: { fullWidth: true, required: true, error: !!formErrors.fecha_asignacion, helperText: formErrors.fecha_asignacion } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required error={!!formErrors.tipo_mantenimiento_asignado}>
                                    <InputLabel id="tipo-asignado-label">Tipo de Mantenimiento Asignado</InputLabel>
                                    <Select
                                        labelId="tipo-asignado-label"
                                        id="tipo_mantenimiento_asignado"
                                        name="tipo_mantenimiento_asignado"
                                        value={formData.tipo_mantenimiento_asignado}
                                        onChange={handleChange}
                                        label="Tipo de Mantenimiento Asignado"
                                    >
                                        {/* Eliminado MenuItem con value="" para evitar enviar cadena vacía a columna NOT NULL */}
                                        {tiposMantenimiento.map(tipo => (
                                            <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.tipo_mantenimiento_asignado && <FormHelperText>{formErrors.tipo_mantenimiento_asignado}</FormHelperText>}
                                </FormControl>
                            </Grid>
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
                                />
                            </Grid>
                        </Grid>

                        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                            <Button
                                type="button"
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate('/asignaciones-mantenimiento/listado')}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                            >
                                {loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Guardar Cambios' : 'Crear Asignación')}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </LocalizationProvider>
    );
};

export default AsignacionForm;
