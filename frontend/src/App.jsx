import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import Login from './pages/Login/Login';
import DashboardLayout from './layout/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

// Páginas
import AdminDashboard from './views/admin/AdminDashboard';
import FreezersListadoPage from './views/admin/FreezerPage'
import FreezerDetallePage from './views/admin/FreezerDetailPage'
import ClientesListadoPage from './views/admin/ClientesPage'
import MantenimientosListadoPage from './views/admin/MantenimientoPage'
import UsuariosAdministradorPage from './views/admin/usuarios/AdministradorPage'
import UsuariosOperadorPage from './views/admin/usuarios/OperadorPage'
import EventosListadoPage from './views/admin/EventosPage'
import DepartamentoListadoPage from './views/admin/DepartamentosPage'
import ZonasListadoPage from './views/admin/ZonasPage'
import AuditoriaPage from './views/admin/AuditoriaPage'

// Estilos
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Routes>
          {/* Página pública */}
          <Route path="/" element={<Login />} />


          <Route element={<PrivateRoute roles={['administrador', 'operador']} />}>
            <Route element={<DashboardLayout />}>
              {/* -------------------------------------------------------- */}
              {/* RUTAS PARA ADMIN */}
              {/* Dashboard */}
              <Route path='/admin-dashboard' element={<AdminDashboard />} />

              {/* Freezers */}
              <Route path='/freezers' element={<FreezersListadoPage />} />
              <Route path='/freezers/:id' element={<FreezerDetallePage />} />

              {/* Clientes */}
              <Route path='/clientes' element={<ClientesListadoPage />} />

              {/* Mantenimientos */}
              <Route path='/mantenimientos' element={<MantenimientosListadoPage />} />

              {/* Usuarios */}
              <Route path='/usuarios/administradores' element={<UsuariosAdministradorPage />} />
              <Route path='/usuarios/operadores' element={<UsuariosOperadorPage />} />

              {/* Eventos de Freezer */}
              <Route path='/eventos' element={<EventosListadoPage />} />

              {/* Ubicaciones */}
              <Route path='/ubicaciones' element={<DepartamentoListadoPage />} />
              <Route path='/ubicaciones/:departamentoId/zonas' element={<ZonasListadoPage />} />

              {/* Auditoría */}
              <Route path='/auditoria' element={<AuditoriaPage />} />
              {/* -------------------------------------------------------- */}
              {/* RUTAS PARA OPERADOR */}



            </Route>
          </Route>

          {/* Redirección para rutas inexistentes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LocalizationProvider>
    </BrowserRouter>
  );
}

export default App;
