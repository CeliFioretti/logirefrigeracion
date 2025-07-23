import React, { useState, useEffect, useContext, useCallback } from 'react';
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

const EventoForm = () => {
    const { id } = useParams(); // 'id' del evento si estamos editando
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
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [allFreezers, setAllFreezers] = useState([]); // Todos los freezers cargados inicialmente
    const [filteredFreezers, setFilteredFreezers] = useState([]); // Freezers filtrados por tipo de evento
    const [allClientes, setAllClientes] = useState([]); // Todos los clientes cargados inicialmente

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
                    // Permitir fechas pasadas para eventos históricos, pero no futuras para creación
                    if (!isEditing && selectedDate > now) {
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

    // Efecto para cargar datos iniciales (freezers y clientes)
    useEffect(() => {
        const fetchData = async () => {
            if (!usuario?.token) {
                setError("No autorizado. Por favor, inicie sesión.");
                setLoading(false);
                return;
            }

            try {
                const [freezersRes, clientesRes] = await Promise.all([
                    axiosInstance.get('/freezers', { headers: { Authorization: `Bearer ${usuario.token}` } }),
                    axiosInstance.get('/clientes', { headers: { Authorization: `Bearer ${usuario.token}` } })
                ]);

                setAllFreezers(freezersRes.data.data);
                setAllClientes(clientesRes.data.data);

                if (id) {
                    setIsEditing(true);
                    const eventoResponse = await axiosInstance.get(`/eventos/${id}`, {
                        headers: { Authorization: `Bearer ${usuario.token}` }
                    });
                    const eventoData = eventoResponse.data.data;

                    setFormData({
                        freezer_id: eventoData.freezer_id ? String(eventoData.freezer_id) : '',
                        cliente_id: eventoData.cliente_id ? String(eventoData.cliente_id) : '',
                        fecha: formatDateForInput(eventoData.fecha),
                        tipo: eventoData.tipo || '',
                        observaciones: eventoData.observaciones || '',
                    });

                    // Setear los objetos seleccionados para Autocomplete en edición
                    const foundFreezer = freezersRes.data.data.find(f => f.id === eventoData.freezer_id);
                    setSelectedFreezer(foundFreezer || null);

                    const foundCliente = clientesRes.data.data.find(c => c.id === eventoData.cliente_id);
                    setSelectedCliente(foundCliente || null);

                    setFilteredFreezers(freezersRes.data.data); // Muestra todos los freezers en edición para referencia

                } else {
                    setIsEditing(false);
                    setFormData(prevData => ({
                        ...prevData,
                        fecha: formatDateForInput(new Date()),
                        tipo: '', // Asegura que el tipo esté vacío al inicio para que el usuario lo seleccione
                        freezer_id: '',
                        cliente_id: ''
                    }));
                    setSelectedFreezer(null);
                    setSelectedCliente(null);
                    setFilteredFreezers([]); // No hay freezers filtrados hasta que se elija un tipo
                }
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar datos:", err.response ? err.response.data : err.message);
                setError("Error al cargar datos iniciales. Verifique permisos o la conexión.");
                setLoading(false);
            }
        };

        fetchData();
    }, [id, usuario?.token]);


    // Efecto para filtrar freezers cuando cambia el tipo de evento
    useEffect(() => {
        if (!isEditing) { 
            if (formData.tipo === 'Entrega') {
                const disponibles = allFreezers.filter(f => f.estado === 'Disponible');
                setFilteredFreezers(disponibles);
                // Si el freezer actualmente seleccionado no es disponible, deseleccionarlo
                if (selectedFreezer && selectedFreezer.estado !== 'Disponible') {
                    setSelectedFreezer(null);
                    setFormData(prev => ({ ...prev, freezer_id: '' }));
                }
                // Habilitar cliente para seleccionar
                if (selectedCliente && !allClientes.find(c => c.id === selectedCliente.id)) {
                    setSelectedCliente(null);
                    setFormData(prev => ({ ...prev, cliente_id: '' }));
                }

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
        }
    }, [formData.tipo, allFreezers, selectedFreezer, selectedCliente, isEditing, allClientes]);


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
        if (!isEditing && formData.tipo === 'Retiro' && newValue) {
            const clienteAsociado = allClientes.find(c => c.id === newValue.cliente_id);
            setSelectedCliente(clienteAsociado || null);
            setFormData(prevData => ({
                ...prevData,
                cliente_id: clienteAsociado ? String(clienteAsociado.id) : '',
            }));
        } else if (!isEditing && formData.tipo === 'Entrega') {
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
            cliente_id: Number(formData.cliente_id),
            fecha: fechaDBFormat,
            tipo: formData.tipo.toLowerCase(), // Asegurar que el tipo va en minúsculas al backend
            observaciones: formData.observaciones || null
        };

        try {
            if (isEditing) {
                // En edición, solo se debería poder modificar las observaciones
                // Otros campos están deshabilitados en el UI y no se envían si no cambian
                const dataToUpdate = {
                    observaciones: dataToSend.observaciones
                };
                await axiosInstance.put(`/eventos/${id}`, dataToUpdate, {
                    headers: { Authorization: `Bearer ${usuario.token}` }
                });
                setSuccessMessage('Evento actualizado correctamente.');
            } else {
                await axiosInstance.post('/eventos', dataToSend, {
                    headers: { Authorization: `Bearer ${usuario.token}` }
                });
                setSuccessMessage('Evento registrado correctamente.');
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
            }
        } catch (err) {
            console.error("Error al enviar el formulario:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Error al guardar el evento. Verifique los datos.');
        } finally {
            setLoading(false);
        }
    };

    // Determinando el estado de disabled para los campos
    const isFreezerDisabled = isEditing || !formData.tipo;
    const isClienteDisabled = isEditing || !formData.tipo || (formData.tipo === 'Retiro' && selectedFreezer);
    const isFechaDisabled = isEditing || !formData.tipo;


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
                <Alert severity="error">No autorizado. Por favor, inicie sesión para {isEditing ? 'editar' : 'registrar'} eventos.</Alert>
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
                    {isEditing ? 'EDITAR EVENTO' : 'REGISTRAR NUEVO EVENTO'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Grid container spacing={0} direction="column">
                        {/* Campo Tipo de Evento (siempre habilitado en creación, deshabilitado en edición) */}
                        <Grid >
                            <FormControl fullWidth required error={!!formErrors.tipo} sx={{ mb: 3 }}>
                                <InputLabel id="tipo-label">Tipo de Evento</InputLabel>
                                <Select
                                    labelId="tipo-label"
                                    id="tipo"
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleTipoChange} // Usar handleTipoChange para limpiar y filtrar
                                    label="Tipo de Evento"
                                    disabled={isEditing}
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
                        <Grid >
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
                        <Grid >
                            <Autocomplete
                                id="cliente_id-autocomplete"
                                options={allClientes} // Siempre muestra todos los clientes para Entrega
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
                                disabled={isFechaDisabled}
                                sx={{ mb: 3 }}
                            />
                        </Grid>

                        {/* Campo Observaciones */}
                        <Grid >
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
                            onClick={() => navigate('/eventos/listado')}
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

export default EventoForm;