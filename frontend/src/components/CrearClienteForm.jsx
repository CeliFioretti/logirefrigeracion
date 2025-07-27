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
    Grid,
    Paper,
    Stack,
} from '@mui/material';


const ClienteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);

    const [formData, setFormData] = useState({
        cuit: '',
        nombre_negocio: '',
        nombre_responsable: '',
        telefono: '',
        correo: '',
        direccion: '',
        tipo_negocio: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);


    // Función de validación de campo individual
    const validateField = (name, value) => {
        let errorMsg = '';
        switch (name) {
            case 'cuit':
                if (!value.trim()) {
                    errorMsg = 'El CUIT es requerido.';
                } else if (!/^\d{11}$/.test(value.trim())) {
                    errorMsg = 'El CUIT debe ser un número de 11 dígitos.';
                }
                break;
            case 'nombre_negocio':
                if (!value.trim()) {
                    errorMsg = 'El nombre del negocio es requerido.';
                } else if (value.trim().length < 3 || value.trim().length > 50) {
                    errorMsg = 'El nombre del negocio debe tener entre 3 y 50 caracteres.';
                }
                break;
            case 'nombre_responsable':
                if (!value.trim()) {
                    errorMsg = 'El nombre del responsable es requerido.';
                } else if (value.trim().length < 3 || value.trim().length > 50) {
                    errorMsg = 'El nombre del responsable debe tener entre 3 y 50 caracteres.';
                }
                break;
            case 'telefono':
                if (value.trim() && !/^\+?\d{7,15}$/.test(value.trim())) {
                    errorMsg = 'El teléfono debe contener solo números y tener entre 7 y 15 dígitos (opcionalmente con + al inicio).';
                }
                break;
            case 'correo':
                if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    errorMsg = 'El correo electrónico no es válido.';
                }
                break;
            case 'direccion':
                if (!value.trim()) {
                    errorMsg = 'La dirección es requerida.';
                } else if (value.trim().length < 5 || value.trim().length > 100) {
                    errorMsg = 'La dirección debe tener entre 5 y 100 caracteres.';
                }
                break;
            case 'tipo_negocio':
                if (!value.trim()) {
                    errorMsg = 'El tipo de negocio es requerido.';
                } else if (value.trim().length < 3 || value.trim().length > 50) {
                    errorMsg = 'El tipo de negocio debe tener entre 3 y 50 caracteres.';
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

        const fieldsToValidate = [
            'cuit',
            'nombre_negocio',
            'nombre_responsable',
            'telefono',
            'correo',
            'direccion',
            'tipo_negocio'
        ]; // Todos los campos a validar

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

    // useEffect para cargar datos del cliente si estamos editando
    useEffect(() => {
        const fetchData = async () => {
            if (usuario?.token) {
                try {
                    if (id) {
                        setIsEditing(true);
                        document.title = 'Editar Cliente - Admin';
                        const response = await axiosInstance.get(`/clientes/${id}`);
                        const clienteData = response.data.data.cliente;

                        setFormData({
                            cuit: clienteData.cuit || '',
                            nombre_negocio: clienteData.nombre_negocio || '',
                            nombre_responsable: clienteData.nombre_responsable || '',
                            telefono: clienteData.telefono || '',
                            correo: clienteData.correo || '',
                            direccion: clienteData.direccion || '',
                            tipo_negocio: clienteData.tipo_negocio || '',
                        });
                    } else {
                        setIsEditing(false);
                        document.title = 'Crear Cliente - Admin';
                        // Reiniciar formData para un nuevo cliente
                        setFormData({
                            cuit: '',
                            nombre_negocio: '',
                            nombre_responsable: '',
                            telefono: '',
                            correo: '',
                            direccion: '',
                            tipo_negocio: '',
                        });
                    }
                    setLoading(false);
                } catch (err) {
                    console.error("Error al cargar datos del cliente:", err.response ? err.response.data : err.message);
                    setError("Error al cargar los datos del cliente. Verifique el ID o la conexión.");
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

        // Limpiar el error del campo específico cuando el usuario empieza a escribir
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
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

        try {
            if (isEditing) {
                await axiosInstance.put(`/clientes/${id}`, formData);
                setSuccessMessage('Cliente actualizado correctamente.');
            } else {
                await axiosInstance.post('/clientes', formData);
                setSuccessMessage('Cliente creado correctamente.');
                setFormData({
                    cuit: '',
                    nombre_negocio: '',
                    nombre_responsable: '',
                    telefono: '',
                    correo: '',
                    direccion: '',
                    tipo_negocio: '',
                });
                setFormErrors({});
            }
            setTimeout(() => {
                navigate('/clientes'); // Redirige al listado de clientes
            }, 2000);
        } catch (err) {
            console.error("Error al enviar el formulario:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || `Error al ${isEditing ? 'actualizar' : 'crear'} el cliente.`);
        } finally {
            setLoading(false);
        }
    };

    // Renderizado condicional para el estado de carga inicial de datos (solo en edición)
    if (loading && isEditing) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
                <Typography variant="h6" align="center">Cargando datos del cliente...</Typography>
            </Container>
        );
    }

    // Renderizado condicional para usuario no autorizado
    if (!usuario?.token) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">No autorizado. Por favor, inicie sesión para {isEditing ? 'editar' : 'crear'} clientes.</Alert>
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
                {isEditing ? 'EDITAR CLIENTE' : 'REGISTRAR CLIENTE'}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
               
                <Grid container spacing={0} direction="column"> 
                   
                    <Grid > 
                        <TextField
                            label="CUIT"
                            variant="outlined"
                            name="cuit"
                            value={formData.cuit}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.cuit}
                            helperText={formErrors.cuit}
                            type="number"
                            inputProps={{
                                pattern: "[0-9]{11}",
                                title: "Debe ser un número de 11 dígitos"
                            }}
                            sx={{ mb: 3 }} 
                        />
                    </Grid>
                    <Grid >
                        <TextField
                            label="Nombre del Negocio"
                            variant="outlined"
                            name="nombre_negocio"
                            value={formData.nombre_negocio}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.nombre_negocio}
                            helperText={formErrors.nombre_negocio}
                            sx={{ mb: 3 }}
                        />
                    </Grid>
                    <Grid >
                        <TextField
                            label="Nombre del Responsable"
                            variant="outlined"
                            name="nombre_responsable"
                            value={formData.nombre_responsable}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.nombre_responsable}
                            helperText={formErrors.nombre_responsable}
                            sx={{ mb: 3 }}
                        />
                    </Grid>
                    <Grid >
                        <TextField
                            label="Teléfono"
                            variant="outlined"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            fullWidth
                            error={!!formErrors.telefono}
                            helperText={formErrors.telefono}
                            type="tel"
                            sx={{ mb: 3 }}
                        />
                    </Grid>
                    <Grid >
                        <TextField
                            label="Correo Electrónico"
                            type="email"
                            variant="outlined"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            fullWidth
                            error={!!formErrors.correo}
                            helperText={formErrors.correo}
                            sx={{ mb: 3 }}
                        />
                    </Grid>
                    <Grid >
                        <TextField
                            label="Dirección"
                            variant="outlined"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.direccion}
                            helperText={formErrors.direccion}
                            sx={{ mb: 3 }}
                        />
                    </Grid>
                    <Grid >
                        <TextField
                            label="Tipo de Negocio"
                            variant="outlined"
                            name="tipo_negocio"
                            value={formData.tipo_negocio}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!!formErrors.tipo_negocio}
                            helperText={formErrors.tipo_negocio}
                            sx={{ mb: 3 }}
                        />
                    </Grid>
                </Grid>

                
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                    <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate('/clientes/listado')}
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

export default ClienteForm;