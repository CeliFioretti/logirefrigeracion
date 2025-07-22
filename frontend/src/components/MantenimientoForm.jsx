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

const MantenimientoForm = () => {
    const { id } = useParams(); // 'id' del mantenimiento si estamos editando
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);

    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        // Ajustar a la zona horaria local para evitar problemas con la visualización de la fecha
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const [formData, setFormData] = useState({
        freezer_id: '',
        fecha: formatDateForInput(new Date()), // Fecha y hora actual por defecto
        descripcion: '',
        tipo: '',
        observaciones: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [freezers, setFreezers] = useState([]); // Para la lista desplegable de freezers
    const [selectedFreezer, setSelectedFreezer] = useState(null); // Estado para el objeto freezer seleccionado en el Autocomplete

    const tiposMantenimiento = ["Preventivo", "Correctivo", "Predictivo", "Inspección"];

    // Función de validación de campo individual
    const validateField = (name, value) => {
        let errorMsg = '';
        switch (name) {
            case 'freezer_id':
                if (!value) {
                    errorMsg = 'El Freezer es requerido.';
                }
                break;
            case 'fecha':
                if (!value) {
                    errorMsg = 'La fecha y hora son requeridas.';
                } else {
                    const selectedDate = new Date(value);
                    const now = new Date();
                    if (selectedDate > now) {
                        errorMsg = 'La fecha no puede ser en el futuro.';
                    }
                }
                break;
            case 'descripcion':
                if (!value.trim()) {
                    errorMsg = 'La descripción es requerida.';
                } else if (value.trim().length < 5 || value.trim().length > 255) {
                    errorMsg = 'La descripción debe tener entre 5 y 255 caracteres.';
                }
                break;
            case 'tipo':
                if (!value) {
                    errorMsg = 'El tipo de mantenimiento es requerido.';
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

        const fieldsToValidate = ['freezer_id', 'fecha', 'descripcion', 'tipo'];
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
                    // Cargar freezers para la lista desplegable
                    const freezersResponse = await axiosInstance.get('/freezers');
                    setFreezers(freezersResponse.data.data);

                    if (id) {
                        setIsEditing(true);
                        const mantenimientoResponse = await axiosInstance.get(`/mantenimientos/${id}`); 
                        const mantenimientoData = mantenimientoResponse.data.data;

                        setFormData({
                            freezer_id: mantenimientoData.freezer_id ? String(mantenimientoData.freezer_id) : '',
                            fecha: formatDateForInput(mantenimientoData.fecha),
                            descripcion: mantenimientoData.descripcion || '',
                            tipo: mantenimientoData.tipo || '',
                            observaciones: mantenimientoData.observaciones || '',
                        });

                        if (mantenimientoData.freezer_id) {
                            const foundFreezer = freezersResponse.data.data.find(
                                (f) => f.id === mantenimientoData.freezer_id
                            );
                            setSelectedFreezer(foundFreezer || null);
                        }

                    } else {
                        setIsEditing(false);
                        setFormData(prevData => ({
                            ...prevData,
                            fecha: formatDateForInput(new Date()) // Asegura la fecha y hora actual para nuevos registros
                        }));
                    }
                    setLoading(false);
                } catch (err) {
                    console.error("Error al cargar datos:", err.response ? err.response.data : err.message);
                    setError("Error al cargar los datos del mantenimiento o freezers. Verifique permisos o la conexión.");
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

    const handleFreezerChange = (event, newValue) => {
        // Actualizacion del estado local del Autocomplete con el objeto completo del freezer seleccionado
        setSelectedFreezer(newValue);

        // Actualizacion de el 'formData' con solo el ID del freezer para enviarlo a la API
        setFormData(prevData => ({
            ...prevData,
            freezer_id: newValue ? String(newValue.id) : '', // Guarda el ID del freezer seleccionado
        }));

        // Limpia cualquier error de validación anterior para el campo 'freezer_id'.
        setFormErrors(prevErrors => ({
            ...prevErrors,
            freezer_id: ''
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

        // Preparar la fecha y hora en el formato correcto para la base de datos (YYYY-MM-DD HH:MM:SS)
        const fechaDBFormat = new Date(formData.fecha).toISOString().slice(0, 19).replace('T', ' ');

        const dataToSend = {
            ...formData,
            freezer_id: Number(formData.freezer_id),
            fecha: fechaDBFormat, // Usar la fecha formateada para el envío
            observaciones: formData.observaciones || null // Asegurar null si está vacío
        };

        try {
            if (isEditing) {
                await axiosInstance.put(`/mantenimientos/${id}`, dataToSend);
                setSuccessMessage('Mantenimiento actualizado correctamente.');
            } else {
                await axiosInstance.post('/mantenimientos', dataToSend);
                setSuccessMessage('Mantenimiento registrado correctamente.');
                // Limpiar formulario para nueva entrada
                setFormData({
                    freezer_id: '',
                    fecha: formatDateForInput(new Date()),
                    descripcion: '',
                    tipo: '',
                    observaciones: '',
                });
                setFormErrors({});
            }
        } catch (err) {
            console.error("Error al enviar el formulario:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Error al guardar el mantenimiento. Verifique los datos.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
                <Typography variant="h6" align="center">Cargando datos del mantenimiento...</Typography>
            </Container>
        );
    }

    if (!usuario?.token) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">No autorizado. Por favor, inicie sesión para {isEditing ? 'editar' : 'registrar'} mantenimientos.</Alert>
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
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ mb: 4 }}>
                    {isEditing ? 'EDITAR MANTENIMIENTO' : 'REGISTRAR MANTENIMIENTO'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Grid container spacing={0} direction="column">
                        <Grid >
                            <Autocomplete
                                id="freezer_id-autocomplete"
                                options={freezers}
                                getOptionLabel={(option) => `ID: ${option.id} - Modelo: ${option.modelo} - Serie: ${option.numero_serie}`}
                                isOptionEqualToValue={(option, value) => option.id === value.id} // Muy importante para pre-seleccionar correctamente
                                onChange={handleFreezerChange}
                                value={selectedFreezer} // Utiliza el estado local para el Autocomplete
                                disabled={isEditing}
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
                        <Grid >
                            <TextField
                                label="Fecha y Hora"
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
                        <Grid >
                            <TextField
                                label="Descripción"
                                variant="outlined"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                fullWidth
                                multiline
                                rows={3}
                                error={!!formErrors.descripcion}
                                helperText={formErrors.descripcion}
                                sx={{ mb: 3 }}
                            />
                        </Grid>
                        <Grid >
                            <FormControl fullWidth required error={!!formErrors.tipo} sx={{ mb: 3 }}>
                                <InputLabel id="tipo-label">Tipo de Mantenimiento</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    id="tipo"
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    label="Tipo de Mantenimiento"
                                >
                                    <MenuItem value="">Seleccione un tipo</MenuItem>
                                    {tiposMantenimiento.map(tipo => (
                                        <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                    ))}
                                </Select>
                                {formErrors.tipo && <FormHelperText>{formErrors.tipo}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid >
                            <TextField
                                label="Observaciones (Opcional)"
                                variant="outlined"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                sx={{ mb: 3 }}
                            />
                        </Grid>
                    </Grid>

                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/mantenimientos/listado')}
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
                            {loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Confirmar Edición' : 'Confirmar')}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default MantenimientoForm;