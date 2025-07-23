import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Stack,
    FormGroup,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import axiosInstance from '../api/axios';
import { UserContext } from '../context/UserContext';

const UserConfiguration = () => {
    const { usuario, setUsuario } = useContext(UserContext); 

    // Estado para la configuración de perfil (nombre y correo)
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [errorProfile, setErrorProfile] = useState(null);
    const [successMessageProfile, setSuccessMessageProfile] = useState(null);

    // Estado para el cambio de contraseña
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [errorPassword, setErrorPassword] = useState(null);
    const [successMessagePassword, setSuccessMessagePassword] = useState(null);

    // Estado para las alertas
    const [notificacionesActivas, setNotificacionesActivas] = useState(false); // A implementar

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre || '');
            setCorreo(usuario.correo || '');
        }
    }, [usuario]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        setErrorProfile(null);
        setSuccessMessageProfile(null);

        if (!nombre.trim() || !correo.trim()) {
            setErrorProfile('El nombre y el correo electrónico son obligatorios.');
            setLoadingProfile(false);
            return;
        }

        try {
            const response = await axiosInstance.put('/usuarios/configuracion', {
                nombre: nombre.trim(),
                correo: correo.trim(),
            }, {
                headers: {
                    Authorization: `Bearer ${usuario.token}`
                }
            });

            setSuccessMessageProfile(response.data.message);
            setUsuario(prev => ({
                ...prev,
                nombre: response.data.data.nombre,
                correo: response.data.data.correo
            }));

        } catch (err) {
            console.error('Error al actualizar perfil:', err.response ? err.response.data : err.message);
            setErrorProfile(err.response?.data?.error || 'Hubo un error al actualizar el perfil.');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        setErrorPassword(null);
        setSuccessMessagePassword(null);

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setErrorPassword('Todos los campos de contraseña son obligatorios.');
            setLoadingPassword(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setErrorPassword('La nueva contraseña y su confirmación no coinciden.');
            setLoadingPassword(false);
            return;
        }

        if (newPassword.length < 8) { // Mínimo 8 caracteres
            setErrorPassword('La nueva contraseña debe tener al menos 8 caracteres.');
            setLoadingPassword(false);
            return;
        }

        if (!/[a-zA-Z]/.test(newPassword)) {
            setErrorPassword('La nueva contraseña debe contener al menos una letra.'); //
            setLoadingPassword(false);
            return;
        }
        if (!/[0-9]/.test(newPassword)) {
            setErrorPassword('La nueva contraseña debe contener al menos un número.'); //
            setLoadingPassword(false);
            return;
        }


        try {
            await axiosInstance.put('/usuarios/cambiar-password', {
                currentPassword,
                newPassword,
                confirmNewPassword
            }, {
                headers: {
                    Authorization: `Bearer ${usuario.token}`
                }
            });

            setSuccessMessagePassword('Contraseña actualizada con éxito.');
            // Limpiar campos de contraseña después de un éxito
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

        } catch (err) {
            console.error('Error al cambiar contraseña:', err.response ? err.response.data : err.message);
            setErrorPassword(err.response?.data?.error || 'Hubo un error al cambiar la contraseña.');
        } finally {
            setLoadingPassword(false);
        }
    };

    if (!usuario) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
                <Typography variant="h6" color="textSecondary" sx={{ ml: 2 }}>Cargando información de usuario...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" component="h1" gutterBottom align="center">
                Configuración de Usuario
            </Typography>

            {/* Sección de Alertas */}
            <Paper elevation={3} sx={{ p: 4, mt: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    ALERTAS
                </Typography>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={notificacionesActivas}
                                onChange={(e) => setNotificacionesActivas(e.target.checked)}
                                disabled 
                            />
                        }
                        label="Activar notificaciones"
                    />
                </FormGroup>
            </Paper>

            {/* Sección de Ajustes Personales (Nombre y Correo) */}
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    AJUSTES PERSONALES
                </Typography>
                {errorProfile && <Alert severity="error" sx={{ mb: 2 }}>{errorProfile}</Alert>}
                {successMessageProfile && <Alert severity="success" sx={{ mb: 2 }}>{successMessageProfile}</Alert>}

                <Box component="form" onSubmit={handleProfileSubmit} noValidate>
                    <TextField
                        label="Nombre Completo"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        disabled={loadingProfile}
                        required
                    />
                    <TextField
                        label="Correo Electrónico"
                        type="email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        disabled={loadingProfile}
                        required
                    />
                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loadingProfile || !nombre.trim() || !correo.trim()}
                            startIcon={loadingProfile && <CircularProgress size={20} color="inherit" />}
                        >
                            {loadingProfile ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            {/* Sección de Cambio de Contraseña */}
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Cambiar contraseña
                </Typography>
                <Box sx={{ mb: 2, ml: 2 }}>
                    <Typography variant="body2" color="textSecondary">Requisitos para contraseña:</Typography>
                    <ul>
                        <li><Typography variant="body2" color="textSecondary">Mínimo 8 caracteres</Typography></li>
                        <li><Typography variant="body2" color="textSecondary">Al menos una letra (a-z o A-Z)</Typography></li>
                        <li><Typography variant="body2" color="textSecondary">Al menos un número (0-9)</Typography></li>
                    </ul>
                </Box>

                {errorPassword && <Alert severity="error" sx={{ mb: 2 }}>{errorPassword}</Alert>}
                {successMessagePassword && <Alert severity="success" sx={{ mb: 2 }}>{successMessagePassword}</Alert>}

                <Box component="form" onSubmit={handlePasswordChange} noValidate>
                    <TextField
                        label="Contraseña actual"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={loadingPassword}
                        required
                    />
                    <TextField
                        label="Nueva contraseña"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loadingPassword}
                        required
                    />
                    <TextField
                        label="Repetir nueva contraseña"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        disabled={loadingPassword}
                        required
                    />

                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            color="inherit"
                            onClick={() => { // Resetear solo campos de contraseña
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmNewPassword('');
                                setErrorPassword(null);
                                setSuccessMessagePassword(null);
                            }}
                            disabled={loadingPassword}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loadingPassword || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword || newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)}
                            startIcon={loadingPassword && <CircularProgress size={20} color="inherit" />}
                        >
                            {loadingPassword ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default UserConfiguration;