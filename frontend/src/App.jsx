import React, { useEffect, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { UserContext } from './context/UserContext';
import { setupAxiosInterceptors } from './api/axios';

import Login from './pages/Login/Login';
import RegistroOperador from './pages/Login/RegistroOperador'
import DashboardLayout from './layout/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

// Administrador
import AdminDashboard from './views/admin/AdminDashboard';
import FreezersListadoPage from './views/admin/FreezerPage';
import FreezerDetallePage from './views/admin/FreezerDetailPage';
import FreezerForm from './components/FreezerForm';
import AsignarForm from './components/AsignarFreezerForm';
import ClientesListadoPage from './views/admin/ClientesPage';
import ClienteDetallePage from './views/admin/ClienteDetailPage';
import CrearClienteForm from './components/CrearClienteForm';
import MantenimientosListadoPage from './views/admin/MantenimientoPage';
import MantenimientosCrearForm from './components/MantenimientoForm';
import UsuariosAdministradorPage from './views/admin/usuarios/AdministradorPage';
import UsuariosOperadorPage from './views/admin/usuarios/OperadorPage';
import CodigosPage from './views/admin/usuarios/CodigosPage';
import EventosListadoPage from './views/admin/EventosPage';
import EventoForm from './components/EventoForm';
import DepartamentoListadoPage from './views/admin/DepartamentosPage';
import ZonasListadoPage from './views/admin/ZonasPage';
import AuditoriaPage from './views/admin/AuditoriaPage';
import UserConfiguration from './components/UserConfiguration';

// Operador
import MenuOperador from './views/operador/MenuOperador'
import MantenimientosPendientesOperador from './views/operador/MantenimientosPendientes'

// Páginas de Error
import NotFoundPage from './views/error/NotFoundPage';
import ForbiddenPage from './views/error/ForbiddenPage';
import SessionExpiredPage from './views/error/SessionExpiredPage';

import './styles/App.css';


const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const AxiosSetup = () => {
    const { logout } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        setupAxiosInterceptors(logout, navigate);
    }, [logout, navigate]);

    return null;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AxiosSetup />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Routes>
                    {/* Rutas públicas y de autenticación */}
                    <Route path="/" element={<Login />} />
                    <Route path="/registro-operador" element={<RegistroOperador />} />
                    <Route path="/acceso-denegado" element={<ForbiddenPage />} />
                    <Route path="/sesion-expirada" element={<SessionExpiredPage />} />

                    {/* ----------------------- RUTAS DEL ADMINISTRADOR ----------------------- */}
                    {/* Protegido por PrivateRoute para administradores y envuelto en DashboardLayout */}
                    <Route element={<PrivateRoute roles={['administrador']} />}>
                        <Route element={<DashboardLayout />}>
                            {/** DASHBOARD */}
                            <Route path='/admin-dashboard' element={<AdminDashboard />} />

                            {/** FREEZERS */}
                            <Route path='/freezers/listado' element={<FreezersListadoPage />} />
                            <Route path='/freezers/:id' element={<FreezerDetallePage />} />
                            <Route path='/freezers/nuevo' element={<FreezerForm />} />
                            <Route path='/freezers/editar/:id' element={<FreezerForm />} />
                            <Route path='/freezers/:id/asignar' element={<AsignarForm />} />

                            {/** CLIENTES */}
                            <Route path='/clientes/listado' element={<ClientesListadoPage />} />
                            <Route path='/clientes/:id' element={<ClienteDetallePage />} />
                            <Route path='/clientes/nuevo' element={<CrearClienteForm />} />
                            <Route path='/clientes/editar/:id' element={<CrearClienteForm />} />

                            {/** MANTENIMIENTOS */}
                            <Route path='/mantenimientos/listado' element={<MantenimientosListadoPage />} />
                            <Route path='/mantenimientos/nuevo' element={<MantenimientosCrearForm />} />
                            <Route path='/mantenimientos/editar/:id' element={<MantenimientosCrearForm />} />

                            {/** USUARIOS */}
                            <Route path='/usuarios/administradores/listado' element={<UsuariosAdministradorPage />} />
                            <Route path='/usuarios/operadores/listado' element={<UsuariosOperadorPage />} />
                            <Route path='/usuarios/codigos-registro' element={<CodigosPage />} />

                            {/** EVENTOS */}
                            <Route path='/eventos/listado' element={<EventosListadoPage />} />
                            <Route path="/eventos/nuevo" element={<EventoForm />} />
                            <Route path="/eventos/editar/:id" element={<EventoForm />} />

                            {/** UBICACIONES */}
                            <Route path='/ubicaciones/departamentos/listado' element={<DepartamentoListadoPage />} />
                            <Route path='/ubicaciones/:departamentoId/zonas' element={<ZonasListadoPage />} />

                            {/** AUDITORÍA DE ACTIVIDADES */}
                            <Route path='/auditoria/listado' element={<AuditoriaPage />} />

                            {/** CONFIGURACIÓN DE USUARIO (para admin) */}
                            <Route path='/configuracion' element={<UserConfiguration />} />
                        </Route>
                    </Route>

                    {/* ----------------------- RUTAS DEL OPERADOR ----------------------- */}
                    {/* Protegido por PrivateRoute para operadores, SIN DashboardLayout */}
                    <Route element={<PrivateRoute roles={['operador']} />}>
                        {/** MENÚ DE OPERADOR */}
                        <Route path='/operador-menu' element={<MenuOperador />} />

                        {/* Rutas específicas del operador (sin DashboardLayout) */}
                        <Route path='/operador/mantenimientos-pendientes' element={<MantenimientosPendientesOperador/>} />
                        <Route path='/operador/zonas-asignadas' element={<div>Zonas Asignadas Operador</div>} />
                        <Route path='/operador/historial-eventos' element={<div>Historial de Eventos Operador</div>} />
                        <Route path='/operador/registrar-evento' element={<div>Registrar Evento Operador</div>} />
                        <Route path='/operador/configuracion' element={<div>Configuración Operador</div>} /> {/* El UserConfiguration si es el mismo, o un nuevo componente */}

                    </Route>

                    {/* ----------------------- PÁGINA DE ERROR POR DEFECTO ----------------------- */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;