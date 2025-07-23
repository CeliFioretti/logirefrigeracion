import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from '@mui/material';
import axiosInstance from '../api/axios';
import { UserContext } from '../context/UserContext';

const EditZonaForm = ({ open, handleClose, onZonaUpdated, zona, departamentoId }) => {
    const { usuario } = useContext(UserContext);
    const [nombreZona, setNombreZona] = useState('');
    const [operadorId, setOperadorId] = useState('');
    const [operadores, setOperadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loadingOperadores, setLoadingOperadores] = useState(true);

   
    useEffect(() => {
        if (open && zona) {
            setNombreZona(zona.zona); 
            setOperadorId(zona.operador_id || ''); 
            setError(null);
            setSuccessMessage(null);
            fetchOperadores(); 
        }
    }, [open, zona]); 

    const fetchOperadores = useCallback(async () => {
        if (!usuario?.token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setLoadingOperadores(false);
            return;
        }
        setLoadingOperadores(true);
        try {
            const response = await axiosInstance.get('/usuarios?rol=operador', {
                headers: {
                    Authorization: `Bearer ${usuario.token}`
                }
            });
            const operadoresFiltrados = response.data.data.filter(user => user.rol === 'operador');
            setOperadores(operadoresFiltrados);
        } catch (err) {
            console.error('Error al obtener operadores:', err.response ? err.response.data : err.message);
            setError('Error al cargar la lista de operadores.');
            setOperadores([]);
        } finally {
            setLoadingOperadores(false);
        }
    }, [usuario?.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!nombreZona.trim()) {
            setError('El nombre de la zona es obligatorio.');
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.put(`/ubicaciones/zonas/${zona.id}`, {
                nombre: nombreZona,
                idOperador: operadorId === '' ? null : operadorId
            }, {
                headers: {
                    Authorization: `Bearer ${usuario?.token}`
                }
            });
            setSuccessMessage('Zona actualizada con éxito.');
            onZonaUpdated(); // Notificar al padre que la zona fue actualizada
            setTimeout(() => {
                handleClose(); // Cerrar el modal después del éxito
            }, 1500);
        } catch (err) {
            console.error('Error al actualizar zona:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Hubo un error al actualizar la zona.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Editar Zona: {zona?.zona}</DialogTitle> 
            <DialogContent>
                <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            label="Nombre de la Zona"
                            variant="outlined"
                            fullWidth
                            required
                            value={nombreZona}
                            onChange={(e) => setNombreZona(e.target.value)}
                            margin="normal"
                            disabled={loading}
                        />

                        <FormControl fullWidth margin="normal" disabled={loading || loadingOperadores}>
                            <InputLabel id="operador-select-label">Operador Asignado (Opcional)</InputLabel>
                            <Select
                                labelId="operador-select-label"
                                id="operador-select"
                                value={operadorId}
                                label="Operador Asignado (Opcional)"
                                onChange={(e) => setOperadorId(e.target.value)}
                                renderValue={(selected) => {
                                    if (selected === '') {
                                        return <em>Ninguno</em>;
                                    }
                                    const selectedOperador = operadores.find(op => op.id === selected);
                                    return selectedOperador ? selectedOperador.nombre : '';
                                }}
                            >
                                <MenuItem value="">
                                    <em>Ninguno</em>
                                </MenuItem>
                                {loadingOperadores ? (
                                    <MenuItem disabled>
                                        <CircularProgress size={20} /> Cargando operadores...
                                    </MenuItem>
                                ) : (
                                    operadores.map((operador) => (
                                        <MenuItem key={operador.id} value={operador.id}>
                                            {operador.nombre}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                            {loadingOperadores && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                    <CircularProgress size={20} />
                                </Box>
                            )}
                        </FormControl>

                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading || !nombreZona.trim()}
                                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </DialogContent>
        </Dialog>
    );
};

export default EditZonaForm;