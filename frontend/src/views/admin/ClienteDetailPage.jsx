import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { es } from 'date-fns/locale';

import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Button,
    Grid,
    Divider,
    CardMedia,
    IconButton
} from '@mui/material';
import { shouldForwardProp } from '@mui/system';

import {
    Edit as EditIcon,
    ContentCopy as ContentCopyIcon,
    Search as SearchIcon, 
    Clear as ClearIcon,  
    Visibility as VisibilityIcon, 
    ArrowBack as ArrowBackIcon,
    ArrowForwardIos as ArrowForwardIosIcon,
    ArrowBackIosNew as ArrowBackIosNewIcon,
} from '@mui/icons-material';

import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { UserContext } from '../../context/UserContext';
import { styled } from '@mui/system'; 

// Componente estilizado para el elemento del carrusel
const CarouselItem = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'isVisible', 
})(({ theme, isVisible }) => ({
    minWidth: 200,
    maxWidth: 300,
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out, box-shadow 0.3s ease',
    transform: isVisible ? 'scale(1)' : 'scale(0.9)',
    opacity: isVisible ? 1 : 0.8,
    boxShadow: isVisible ? theme.shadows[6] : theme.shadows[1],
    '&:hover': {
        transform: 'scale(1.03)',
        boxShadow: theme.shadows[8],
    },
}));

function ClienteDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);
    const token = usuario?.token;

    // Estados del Cliente
    const [currentClient, setCurrentClient] = useState(null);
    const [loadingClient, setLoadingClient] = useState(true);
    const [errorClient, setErrorClient] = useState(null);

    // Estados de Freezers Asignados (para la tabla, si la mantienes, o para todos los freezers para el carrusel)
    const [freezersAsignados, setFreezersAsignados] = useState([]);
    const [loadingFreezers, setLoadingFreezers] = useState(false);
    const [errorFreezers, setErrorFreezers] = useState(null);


    // Estado para el carrusel de freezers
    const [currentFreezerIndex, setCurrentFreezerIndex] = useState(0);
    const freezersPerPage = 3; 

    // Obtener detalles del Cliente
    const fetchClientDetails = useCallback(async () => {
        if (!token) {
            setErrorClient('No autenticado. Por favor, inicie sesión.');
            setLoadingClient(false);
            return;
        }
        setLoadingClient(true);
        setErrorClient(null);
        try {
            const url = `/clientes/${id}`;
            const response = await axiosInstance.get(url)
            setCurrentClient(response.data.data.cliente);
        } catch (err) {
            console.error('Error fetching client details:', err);
            setErrorClient('Error al cargar los detalles del cliente. Inténtelo de nuevo.');
        } finally {
            setLoadingClient(false);
        }
    }, [id, token]);

    const fetchAllFreezersForCarousel = useCallback(async () => {
        if (!token || !id) {
            setErrorFreezers('No autenticado o ID de cliente no disponible.');
            setLoadingFreezers(false);
            return;
        }

        setLoadingFreezers(true);
        setErrorFreezers(null);

        try {

            const url = `/freezers/cliente/${id}?pageSize=999`; 
            const response = await axiosInstance.get(url)

            setFreezersAsignados(response.data.data || []);
        } catch (err) {
            console.error('Error fetching freezers asignados para carrusel:', err);
            setErrorFreezers('Error al cargar los freezers asignados para el carrusel.');
        } finally {
            setLoadingFreezers(false);
        }
    }, [id, token]);


    useEffect(() => {
        fetchClientDetails();
        fetchAllFreezersForCarousel();
    }, [fetchClientDetails, fetchAllFreezersForCarousel]);

    useEffect(() => {
        if (currentClient) {
            document.title = `${currentClient.nombre_responsable || 'Cliente'} - Admin`;
        } else {
            document.title = 'Detalle del Cliente - Admin';
        }
    }, [currentClient]);



    const handleEditClient = () => {
        navigate(`/clientes/editar/${id}`);
    };

    const handleCopyClientData = () => {
        if (currentClient) {
            const dataToCopy = `Nombre: ${currentClient.nombre_responsable}\nCUIT: ${currentClient.cuit}\nEmail: ${currentClient.correo}\nTeléfono: ${currentClient.telefono}\nDirección: ${currentClient.direccion}\nTipo de Negocio: ${currentClient.tipo_negocio}`;
            navigator.clipboard.writeText(dataToCopy)
                .then(() => alert('Datos del cliente copiados al portapapeles'))
                .catch(err => console.error('Error al copiar:', err));
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleViewFreezerDetail = (freezerId) => {
        navigate(`/freezers/${freezerId}`);
    };

    // Lógica del Carrusel
    const handleNextFreezer = () => {
        setCurrentFreezerIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            if (nextIndex * freezersPerPage >= freezersAsignados.length && freezersAsignados.length > freezersPerPage) {
                return 0; 
            }
            return nextIndex;
        });
    };

    const handlePrevFreezer = () => {
        setCurrentFreezerIndex((prevIndex) => {
            const newIndex = prevIndex - 1;
            if (newIndex < 0) {
                return Math.max(0, Math.ceil(freezersAsignados.length / freezersPerPage) - 1);
            }
            return newIndex;
        });
    };

    // Calcular qué freezers mostrar en el carrusel
    const getVisibleFreezers = () => {
        const startIndex = currentFreezerIndex * freezersPerPage;
        const endIndex = startIndex + freezersPerPage;
        return freezersAsignados.slice(startIndex, endIndex);
    };

    const visibleFreezers = getVisibleFreezers();

    // Determinar si los botones de navegación deben estar deshabilitados
    const showNavigationButtons = freezersAsignados.length > freezersPerPage;
    const isPrevDisabled = currentFreezerIndex === 0;
    const isNextDisabled = (currentFreezerIndex + 1) * freezersPerPage >= freezersAsignados.length;

    if (loadingClient) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (errorClient) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{errorClient}</Alert>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/clientes')}>
                    Volver al Listado de Clientes
                </Button>
            </Container>
        );
    }

    if (!currentClient) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="info">Cliente no encontrado o ID inválido.</Alert>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/clientes')}>
                    Volver al Listado de Clientes
                </Button>
            </Container>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            {/* Flecha de vuelta */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handleGoBack} aria-label="Volver">
                    <ArrowBackIcon fontSize='large' />
                </IconButton>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography fontWeight="bold" variant="h3" component="h1" gutterBottom sx={{ mb: 3, textTransform: 'uppercase ' }}>
                    {currentClient.nombre_responsable || 'N/A'}
                </Typography>

                {/* Sección de Detalles del Cliente */}
                <Paper elevation={3} sx={{ p: 3, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>Detalles del Cliente</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid>
                                <Typography variant="subtitle1" color="text.secondary">CUIT:</Typography>
                                <Typography variant="body1" fontWeight="bold">{currentClient.cuit || 'N/A'}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle1" color="text.secondary">Email:</Typography>
                                <Typography variant="body1" fontWeight="bold">{currentClient.correo || 'N/A'}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle1" color="text.secondary">Teléfono:</Typography>
                                <Typography variant="body1" fontWeight="bold">{currentClient.telefono || 'N/A'}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle1" color="text.secondary">Dirección:</Typography>
                                <Typography variant="body1" fontWeight="bold">{currentClient.direccion || 'N/A'}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle1" color="text.secondary">Tipo de Negocio:</Typography>
                                <Typography variant="body1" fontWeight="bold">{currentClient.tipo_negocio || 'N/A'}</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 250 }, height: { xs: 200, md: 'auto' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {currentClient.imagen ? (
                            <CardMedia
                                component="img"
                                image={currentClient.imagen}
                                alt={`Imagen del Cliente ${currentClient.nombre_responsable}`}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    boxShadow: 3
                                }}
                            />
                        ) : (
                            <Paper
                                elevation={1}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    bgcolor: 'grey.100',
                                    color: 'grey.500',
                                    borderRadius: 1
                                }}
                            >
                                <CameraAltIcon sx={{ fontSize: 60, mb: 1 }} />
                                <Typography variant="caption">Sin Imagen</Typography>
                            </Paper>
                        )}
                    </Box>
                </Paper>

                {/* Sección del Carrusel de Freezers Asignados */}
                <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
                    Freezers Asignados
                </Typography>
                <Paper elevation={3} sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 250 }}>
                    {loadingFreezers ? (
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : errorFreezers ? (
                        <Box sx={{ flexGrow: 1, textAlign: 'center', py: 3 }}>
                            <Alert severity="error">{errorFreezers}</Alert>
                        </Box>
                    ) : freezersAsignados.length > 0 ? (
                        <>
                            <IconButton
                                onClick={handlePrevFreezer}
                                disabled={!showNavigationButtons || isPrevDisabled}
                                sx={{ mr: 1 }}
                            >
                                <ArrowBackIosNewIcon fontSize="large" />
                            </IconButton>

                            <Box
                                sx={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflowX: 'hidden', 
                                    gap: 2, 
                                    transform: `translateX(-${(currentFreezerIndex % Math.ceil(freezersAsignados.length / freezersPerPage)) * (100 / freezersPerPage)}%)`, // Esto requiere más precisión si los elementos no tienen ancho fijo.
                                    transition: 'transform 0.5s ease-in-out',
                                }}
                            >
                                {visibleFreezers.map((freezer, index) => (
                                    <CarouselItem
                                        key={freezer.id}
                                        isVisible={true}
                                        onClick={() => handleViewFreezerDetail(freezer.id)}
                                        sx={{
                                            flexShrink: 0,
                                            width: `calc(100% / ${freezersPerPage} - 16px)`, 
                                            minWidth: 200,
                                            maxWidth: 300,
                                        }}
                                    >
                                        {freezer.imagen ? (
                                            <CardMedia
                                                component="img"
                                                image={freezer.imagen}
                                                alt={`Freezer ${freezer.numero_serie}`}
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 180,
                                                    height: 'auto',
                                                    maxHeight: 120,
                                                    objectFit: 'contain',
                                                    mb: 1.5,
                                                    borderRadius: 1,
                                                    boxShadow: 2
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                component="img"
                                                src='https://img.freepik.com/premium-vector/modern-refrigerator-vector-illustration-white-background_1138840-2108.jpg'
                                                alt='Imagen no disponible'
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 180,
                                                    height: 'auto',
                                                    maxHeight: 120,
                                                    objectFit: 'contain',
                                                    mb: 1.5,
                                                    borderRadius: 1,
                                                    boxShadow: 2,
                                                    backgroundColor: '#f0f0f0'
                                                }}
                                            />
                                        )}
                                        <Typography variant="h6" fontWeight="bold" noWrap>
                                            {freezer.numero_serie || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {freezer.modelo} - {freezer.marca}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ mt: 1 }}
                                            onClick={(e) => { e.stopPropagation(); handleViewFreezerDetail(freezer.id); }}
                                        >
                                            Ver Detalle
                                        </Button>
                                    </CarouselItem>
                                ))}
                            </Box>

                            <IconButton
                                onClick={handleNextFreezer}
                                disabled={!showNavigationButtons || isNextDisabled}
                                sx={{ ml: 1 }}
                            >
                                <ArrowForwardIosIcon fontSize="large" />
                            </IconButton>
                        </>
                    ) : (
                        <Box sx={{ flexGrow: 1, textAlign: 'center', py: 3 }}>
                            <Typography variant="h6" color="text.secondary">No hay freezers asignados a este cliente para mostrar.</Typography>
                        </Box>
                    )}
                </Paper>
                {freezersAsignados.length > freezersPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        {Array.from({ length: Math.ceil(freezersAsignados.length / freezersPerPage) }).map((_, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: idx === currentFreezerIndex ? 'primary.main' : 'grey.400',
                                    mx: 0.5,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                }}
                                onClick={() => setCurrentFreezerIndex(idx)}
                            />
                        ))}
                    </Box>
                )}


                {/* Sección de Botones de Acción */}
                <Grid container spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                    <Grid>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEditClient}
                        >
                            Editar datos del Cliente
                        </Button>
                    </Grid>
                    <Grid>
                        <Button
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopyClientData}
                        >
                            Copiar datos
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </LocalizationProvider>
    );
}

export default ClienteDetailPage;