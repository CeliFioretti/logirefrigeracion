import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { UserContext } from '../context/UserContext';

// Importaciones de Material-UI
import {
    Box,
    Button,
    Typography,
    Container,
    Alert,
    CircularProgress,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Paper,
    Stack,
    Grid, 
} from '@mui/material';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported'; 

const AsignarFreezerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);

    const [freezer, setFreezer] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const freezerResponse = await axiosInstance.get(`/freezers/${id}`);
                setFreezer(freezerResponse.data.data);

                // Si el freezer ya está asignado, pre-seleccionar el cliente
                if (freezerResponse.data.data.cliente_id) {
                    setSelectedClientId(String(freezerResponse.data.data.cliente_id));
                }


                
                const clientesResponse = await axiosInstance.get('/clientes');
                setClientes(clientesResponse.data.data);

                setLoading(false);
            } catch (err) {
                console.error("Error al cargar datos:", err.response ? err.response.data : err.message);
                setError("Error al cargar los datos necesarios para asignar el freezer. Verifique permisos o la conexión.");
                setLoading(false);
            }
        };

        if (usuario?.token) {
            fetchData();
        } else {
            setError("No autorizado. Por favor, inicie sesión.");
            setLoading(false);
        }
    }, [id, usuario?.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        if (!selectedClientId) {
            setError("Por favor, seleccione un cliente.");
            setIsSubmitting(false);
            return;
        }

        if (freezer.estado !== 'Disponible') {
            setError(`El freezer no está disponible para asignación. Su estado actual es: ${freezer.estado}`);
            setIsSubmitting(false);
            return;
        }

        try {
            await axiosInstance.put(`/freezers/${id}/asignar`, { cliente_id: Number(selectedClientId) });
            setSuccessMessage("Freezer asignado correctamente.");

            setTimeout(() => {
                navigate(`/freezers/${id}`);
            }, 2000);
        } catch (err) {
            console.error("Error al asignar freezer:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Hubo un error al asignar el freezer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
                <Typography variant="h6" align="center">Cargando información del freezer y clientes...</Typography>
            </Container>
        );
    }

    if (!usuario?.token) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">No autorizado. Por favor, inicie sesión para asignar freezers.</Alert>
            </Container>
        );
    }

    if (error && !freezer) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    // Comprobación de estado para asignar
    const canAssign = freezer?.estado === 'Disponible';

    // Función para obtener el color del estado
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'disponible':
                return 'success.main';
            case 'asignado':
                return 'info.main';
            case 'baja':
                return 'error.main';
            case 'mantenimiento':
                return 'warning.main';
            default:
                return 'text.primary';
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ mb: 4 }}>
                    Asignar Freezer a Cliente
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                {freezer ? (
                    <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
                        <Box sx={{ flexShrink: 0, width: 150, height: 150, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {freezer.imagen ? (
                                <Box component="img" src={freezer.imagen} alt="Imagen del Freezer" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <ImageNotSupportedIcon sx={{ fontSize: '4rem', color: 'grey.400' }} />
                            )}
                        </Box>
                        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="h6" gutterBottom>Detalles del Freezer:</Typography>
                            <Typography><strong>ID:</strong> {freezer.id}</Typography>
                            <Typography><strong>Número de Serie:</strong> {freezer.numero_serie}</Typography>
                            <Typography><strong>Modelo:</strong> {freezer.modelo}</Typography>
                            <Typography>
                                <strong>Estado Actual:</strong>{' '}
                                <Typography component="span" sx={{ color: getStatusColor(freezer.estado), fontWeight: 'bold' }}>
                                    {freezer.estado}
                                </Typography>
                            </Typography>
                            {freezer.cliente_id && <Typography><strong>Asignado a Cliente ID:</strong> {freezer.cliente_id}</Typography>}
                        </Box>
                    </Paper>
                ) : (
                    <Typography variant="body1" align="center" sx={{ mb: 3 }}>No se encontraron detalles del freezer.</Typography>
                )}

                {!canAssign && freezer && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Este freezer no puede ser asignado porque su estado actual es "{freezer.estado}". Solo los freezers en estado "Disponible" pueden asignarse.
                    </Alert>
                )}

                {canAssign && (
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <FormControl fullWidth required sx={{ mb: 3 }}>
                            <InputLabel id="cliente_id-label">Seleccionar Cliente</InputLabel>
                            <Select
                                labelId="cliente_id-label"
                                id="cliente_id"
                                value={selectedClientId}
                                label="Seleccionar Cliente"
                                onChange={(e) => setSelectedClientId(e.target.value)}
                            >
                                <MenuItem value="">-- Seleccione un cliente --</MenuItem>
                                {clientes.map(cliente => (
                                    <MenuItem key={cliente.id} value={cliente.id}>
                                        {cliente.nombre_negocio} ({cliente.nombre_responsable})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate(`/freezers/${id}`)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting || !selectedClientId}
                                startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                            >
                                {isSubmitting ? 'Asignando...' : 'Asignar Freezer'}
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default AsignarFreezerForm;