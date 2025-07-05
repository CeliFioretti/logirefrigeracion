import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login/Login';
import DashboardLayout from './layout/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

// Páginas
import AdminDashboard from './views/admin/AdminDashboard';
import FreezersListadoPage from './views/admin/FreezerPage'
import ClientesListadoPage from './views/admin/ClientesPage'
import MantenimientosListadoPage from './views/admin/MantenimientoPage'
import EventosListadoPage from './views/admin/EventosPage'
import UbicacionesListadoPage from './views/admin/UbicacionesPage'
import AuditoriaPage from './views/admin/AuditoriaPage'
import OperatorDashboard from './views/operador/OperadorDashboard'

// Estilos
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<Login />} />


        <Route element={<PrivateRoute roles={['administrador', 'operador']} />}>
          <Route element={<DashboardLayout />}>
            {/* Rutas para ADMIN */}
            <Route path='/admin-dashboard' element={<AdminDashboard />} />
            <Route path='/freezers' element={<FreezersListadoPage />} />
            <Route path='/clientes' element={<ClientesListadoPage />} />
            <Route path='/mantenimientos' element={<MantenimientosListadoPage />} />
            <Route path='/eventos' element={<EventosListadoPage />} />
            <Route path='/ubicaciones' element={<UbicacionesListadoPageListadoPage />} />
            <Route path='/auditoria' element={<AuditoriaPage />} />

            {/* Rutas para OPERADOR */}


            
          </Route>
        </Route>

        {/* Redirección para rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
