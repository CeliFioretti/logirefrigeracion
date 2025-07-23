import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Button,
    TextField,
    Alert,
    CircularProgress,
    Paper,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import axiosInstance from '../api/axios';
import { UserContext } from '../context/UserContext';

const EditDepartamentoForm = ({ open, handleClose, onDepartamentoUpdated, departamento }) => {
    const { usuario } = useContext(UserContext);
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (departamento) {
            setNombre(departamento.nombre);
        }
    }, [departamento]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!nombre.trim()) {
            setError('El nombre del departamento es obligatorio.');
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.put(`/ubicaciones/${departamento.id}`, { nombre }, {
                headers: {
                    Authorization: `Bearer ${usuario?.token}`
                }
            });
            setSuccessMessage('Departamento actualizado con éxito.');
            onDepartamentoUpdated(); // Notificar al padre que el departamento fue actualizado
            setTimeout(() => {
                handleClose(); // Cerrar el modal después del éxito
            }, 1500);
        } catch (err) {
            console.error('Error al actualizar departamento:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Hubo un error al actualizar el departamento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Editar Departamento</DialogTitle>
            <DialogContent>
                <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            label="Nombre del Departamento"
                            variant="outlined"
                            fullWidth
                            required
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            margin="normal"
                            disabled={loading}
                        />
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
                                disabled={loading || !nombre.trim()}
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

export default EditDepartamentoForm;