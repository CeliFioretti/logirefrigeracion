import React, { useEffect, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { UserContext } from './context/UserContext';
import { setupAxiosInterceptors } from './api/axios';

import Login from './pages/Login/Login';
import DashboardLayout from './layout/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

import AdminDashboard from './views/admin/AdminDashboard';
import FreezersListadoPage from './views/admin/FreezerPage';
import FreezerDetallePage from './views/admin/FreezerDetailPage';
import FreezerForm from './components/FreezerForm';
import AsignarForm from './components/AsignarFreezerForm';
import ClientesListadoPage from './views/admin/ClientesPage';
import ClienteDetallePage from './views/admin/ClienteDetailPage';
import MantenimientosListadoPage from './views/admin/MantenimientoPage';
import UsuariosAdministradorPage from './views/admin/usuarios/AdministradorPage';
import UsuariosOperadorPage from './views/admin/usuarios/OperadorPage';
import EventosListadoPage from './views/admin/EventosPage';
import DepartamentoListadoPage from './views/admin/DepartamentosPage';
import ZonasListadoPage from './views/admin/ZonasPage';
import AuditoriaPage from './views/admin/AuditoriaPage';

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
                    <Route path="/" element={<Login />} />

                    <Route element={<PrivateRoute roles={['administrador', 'operador']} />}>
                        <Route element={<DashboardLayout />}>
                            <Route path='/admin-dashboard' element={<AdminDashboard />} />

                            <Route path='/freezers/listado' element={<FreezersListadoPage />} />
                            <Route path='/freezers/:id' element={<FreezerDetallePage />} />
                            <Route path='/freezers/nuevo' element={<FreezerForm />} />
                            <Route path='/freezers/editar/:id' element={<FreezerForm />} />
                            <Route path='/freezers/:id/asignar' element={<AsignarForm />} />

                            <Route path='/clientes' element={<ClientesListadoPage />} />
                            <Route path='/clientes/:id' element={<ClienteDetallePage />} />

                            <Route path='/mantenimientos' element={<MantenimientosListadoPage />} />

                            <Route path='/usuarios/administradores' element={<UsuariosAdministradorPage />} />
                            <Route path='/usuarios/operadores' element={<UsuariosOperadorPage />} />

                            <Route path='/eventos' element={<EventosListadoPage />} />

                            <Route path='/ubicaciones' element={<DepartamentoListadoPage />} />
                            <Route path='/ubicaciones/:departamentoId/zonas' element={<ZonasListadoPage />} />

                            <Route path='/auditoria' element={<AuditoriaPage />} />

                            <Route path='/acceso-denegado' element={<ForbiddenPage />} />
                            <Route path='/sesion-expirada' element={<SessionExpiredPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;