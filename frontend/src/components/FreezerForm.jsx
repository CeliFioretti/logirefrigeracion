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
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Grid,
    FormHelperText,
    Paper,
    Stack,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const FreezerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        modelo: '',
        numero_serie: '',
        tipo: '',
        fecha_creacion: formatDate(new Date()),
        marca: '',
        capacidad: '',
        imagen: '',
        cliente_id: '',
        estado: 'Disponible'
    });

    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [initialFreezerState, setInitialFreezerState] = useState(null);

    const tiposFreezer = ["Horizontal", "Horizontal No-Frost", "Vertical", "Vertical No-Frost"];
    const estadosManualesFreezer = ["Disponible", "Baja", "Mantenimiento"];

    // Función de validación de campo individual
    const validateField = (name, value) => {
        let errorMsg = '';
        switch (name) {
            case 'modelo':
                if (!value.trim()) {
                    errorMsg = 'El modelo es requerido.';
                } else if (!/^[a-zA-Z0-9-]{3,15}$/.test(value)) {
                    errorMsg = 'El modelo debe contener letras, números o guiones y tener entre 3 y 15 caracteres. Ej: FZ-300';
                }
                break;
            case 'numero_serie':
                if (!value.trim()) {
                    errorMsg = 'El número de serie es requerido.';
                } else if (!/^[a-zA-Z0-9- ]{5,20}$/.test(value)) {
                    errorMsg = 'El número de serie debe contener letras, números, guiones o espacios y tener entre 5 y 20 caracteres. Ej: HZ-LG-2025-001';
                }
                break;
            case 'tipo':
                if (!value) {
                    errorMsg = 'El tipo es requerido.';
                }
                break;
            case 'fecha_creacion':
                if (!value) {
                    errorMsg = 'La fecha de adquisición es requerida.';
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate > today) {
                        errorMsg = 'La fecha de adquisición no puede ser futura.';
                    }
                }
                break;
            case 'marca':
                if (!value.trim()) {
                    errorMsg = 'La marca es requerida.';
                } else if (value.trim().length < 2 || value.trim().length > 20) {
                    errorMsg = 'La marca debe tener entre 2 y 20 caracteres.';
                }
                break;
            case 'capacidad':
                const numValue = Number(value);
                if (isNaN(numValue) || value === '') {
                    errorMsg = 'La capacidad es requerida y debe ser un número.';
                } else if (numValue <= 0) {
                    errorMsg = 'La capacidad debe ser un número positivo.';
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

        const fieldsToValidate = ['modelo', 'numero_serie', 'tipo', 'fecha_creacion', 'marca', 'capacidad'];
        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });

        // Validación específica para el estado y cliente_id
        if (formData.cliente_id && formData.estado !== "Asignado") {
            errors.estado = 'Si se asigna un cliente, el estado debe ser "Asignado".';
            isValid = false;
        }
        if (!formData.cliente_id && formData.estado === "Asignado") {
            errors.estado = 'No se puede tener un freezer en estado "Asignado" sin un cliente asignado.';
            isValid = false;
        }

        // Regla del backend: No se puede cambiar a Baja/Mantenimiento si hay cliente asignado
        if (isEditing && initialFreezerState?.cliente_id !== null && formData.cliente_id !== null && (formData.estado === "Baja" || formData.estado === "Mantenimiento")) {
            errors.estado = 'Primero debe desasignar el cliente para poder cambiar el estado a "Baja" o "Mantenimiento".';
            isValid = false;
        }


        setFormErrors(errors);
        return isValid;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!usuario?.token) {
                setError("No autorizado. Por favor, inicie sesión.");
                setLoading(false);
                return;
            }

            try {
                // Cargar clientes
                const clientesResponse = await axiosInstance.get('/clientes');
                setClientes(clientesResponse.data.data);

                if (id) {
                    setIsEditing(true);
                    const freezerResponse = await axiosInstance.get(`/freezers/${id}`);
                    const freezerData = freezerResponse.data.data;

                    // Guarda el estado inicial del freezer para validaciones en edición
                    setInitialFreezerState({
                        cliente_id: freezerData.cliente_id,
                        estado: freezerData.estado
                    });

                    setFormData({
                        modelo: freezerData.modelo || '',
                        numero_serie: freezerData.numero_serie || '',
                        tipo: freezerData.tipo || '',
                        fecha_creacion: freezerData.fecha_creacion ? new Date(freezerData.fecha_creacion).toISOString().split('T')[0] : '',
                        marca: freezerData.marca || '',
                        capacidad: freezerData.capacidad || '',
                        imagen: freezerData.imagen || '',
                        cliente_id: freezerData.cliente_id ? String(freezerData.cliente_id) : '', // Asegura que sea string para el Select
                        estado: freezerData.estado || 'Disponible'
                    });
                } else {
                    setIsEditing(false);
                    setFormData(prevData => ({
                        ...prevData,
                        estado: 'Disponible',
                        fecha_creacion: formatDate(new Date())
                    }));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar datos:", err.response ? err.response.data : err.message);
                setError("Error al cargar los datos del freezer o clientes. Verifique permisos o la conexión.");
                setLoading(false);
            }
        };

        fetchData();
    }, [id, usuario?.token]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevData => {
            const newData = { ...prevData, [name]: value };

            // Lógica para auto-establecer el estado del freezer cuando cambia cliente_id
            if (name === "cliente_id") {
                if (value !== "") {
                    newData.estado = "Asignado";
                } else {
                    if (prevData.estado === "Asignado") {
                        newData.estado = "Disponible";
                    }
                }
            }
            return newData;
        });

        // Limpiar el error del campo específico cuando el usuario empieza a escribir
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prevData => ({
                    ...prevData,
                    imagen: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
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
            ...formData,
            capacidad: formData.capacidad ? Number(formData.capacidad) : null,
            cliente_id: formData.cliente_id === '' ? null : Number(formData.cliente_id),
            estado: formData.estado
        };

        try {
            if (isEditing) {
                await axiosInstance.put(`/freezers/${id}`, dataToSend);
                setSuccessMessage('Freezer actualizado correctamente.');
            } else {
                await axiosInstance.post('/freezers', dataToSend);
                setSuccessMessage('Freezer creado correctamente.');
                // Limpiar formulario para nueva entrada
                setFormData({
                    modelo: '',
                    numero_serie: '',
                    tipo: '',
                    fecha_creacion: formatDate(new Date()),
                    marca: '',
                    capacidad: '',
                    imagen: '',
                    cliente_id: '',
                    estado: 'Disponible'
                });
                setFormErrors({});
            }
            setTimeout(() => {
                navigate('/freezers/listado');
            }, 2000);
        } catch (err) {
            console.error("Error al enviar el formulario:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Error al guardar el freezer. Verifique los datos o el tamaño de la imagen.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && (isEditing || id === undefined)) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
                <Typography variant="h6" align="center">Cargando datos del freezer...</Typography>
            </Container>
        );
    }

    if (!usuario?.token) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">No autorizado. Por favor, inicie sesión para {isEditing ? 'editar' : 'crear'} freezers.</Alert>
            </Container>
        );
    }

    // Determina si el campo de estado debe estar deshabilitado
    const isEstadoDisabled = !!formData.cliente_id;

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
                    {isEditing ? 'EDITAR FREEZER' : 'REGISTRAR FREEZER'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                <Grid container spacing={3} component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Sección de la imagen */}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 250 }}>
                            <Box
                                sx={{
                                    width: 200,
                                    height: 200,
                                    bgcolor: 'grey.100',
                                    border: '2px dashed',
                                    borderColor: 'grey.400',
                                    borderRadius: 2,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                    overflow: 'hidden',
                                }}
                            >
                                {formData.imagen ? (
                                    <Box
                                        component="img"
                                        src={formData.imagen}
                                        alt="Previsualización del Freezer"
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }}
                                    />
                                ) : (
                                    <PhotoCameraIcon sx={{ fontSize: '4rem', color: 'grey.500' }} />
                                )}
                            </Box>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                                Escoge la imagen del Freezer
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </Button>
                        </Box>
                    </Grid>

                    {/* Campos del formulario */}
                    {/* Todos los Grid item tienen xs={12} para asegurar que se apilen verticalmente */}
                    <Grid>
                        <Grid item xs={12}>
                        <TextField
                            label="Modelo"
                            variant="outlined"
                            name="modelo"
                            value={formData.modelo}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.modelo}
                            helperText={formErrors.modelo}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Número de serie"
                            variant="outlined"
                            name="numero_serie"
                            value={formData.numero_serie}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.numero_serie}
                            helperText={formErrors.numero_serie}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required error={!!formErrors.tipo} sx={{ mb: 2 }}>
                            <InputLabel id="tipo-label">Tipo</InputLabel>
                            <Select
                                labelId="tipo-label"
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                label="Tipo"
                            >
                                <MenuItem value="">Seleccione un tipo</MenuItem>
                                {tiposFreezer.map(tipo => (
                                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                ))}
                            </Select>
                            {formErrors.tipo && <FormHelperText>{formErrors.tipo}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Fecha de adquisición"
                            type="date"
                            variant="outlined"
                            name="fecha_creacion"
                            value={formData.fecha_creacion}
                            onChange={handleChange}
                            required
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!formErrors.fecha_creacion}
                            helperText={formErrors.fecha_creacion}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Marca"
                            variant="outlined"
                            name="marca"
                            value={formData.marca}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.marca}
                            helperText={formErrors.marca}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Capacidad"
                            type="number"
                            variant="outlined"
                            name="capacidad"
                            value={formData.capacidad}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.capacidad}
                            helperText={formErrors.capacidad}
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="cliente_id-label">Cliente Asignado</InputLabel>
                            <Select
                                labelId="cliente_id-label"
                                id="cliente_id"
                                name="cliente_id"
                                value={formData.cliente_id}
                                onChange={handleChange}
                                label="Cliente Asignado"
                            >
                                <MenuItem value="">Ninguno</MenuItem>
                                {clientes.map(cliente => (
                                    <MenuItem key={cliente.id} value={cliente.id}>
                                        {cliente.nombre_negocio} ({cliente.nombre_responsable})
                                    </MenuItem>
                                ))}
                            </Select>
                            {!!formData.cliente_id && (
                                <FormHelperText sx={{ color: 'info.main' }}>
                                    El estado se forzará a "Asignado" si se selecciona un cliente.
                                </FormHelperText>
                            )}
                            {formErrors.cliente_id && <FormHelperText error>{formErrors.cliente_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.estado}>
                            <InputLabel id="estado-label">Estado</InputLabel>
                            <Select
                                labelId="estado-label"
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                label="Estado"
                                disabled={isEstadoDisabled}
                            >
                                {isEstadoDisabled ? (
                                    <MenuItem value="Asignado">Asignado</MenuItem>
                                ) : (
                                    estadosManualesFreezer.map(estado => (
                                        <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                                    ))
                                )}
                            </Select>
                            {isEstadoDisabled && (
                                <FormHelperText sx={{ color: 'info.main' }}>
                                    El estado es "Asignado" porque hay un cliente.
                                </FormHelperText>
                            )}
                            {!isEstadoDisabled && formData.estado === "Disponible" && (
                                <FormHelperText sx={{ color: 'info.main' }}>
                                    El estado es "Disponible" al no tener un cliente asignado.
                                </FormHelperText>
                            )}
                            {formErrors.estado && <FormHelperText>{formErrors.estado}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    {/* Botones de acción */}
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                            <Button
                                type="button"
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate('/freezers/listado')}
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
                    </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default FreezerForm;