import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login/Login';
import DashboardLayout from './layout/DashboardLayout'; 
import PrivateRoute from './components/PrivateRoute';

// Estilos
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<Login />} />

        {/* Dashboard general (admin u operador), protegido por roles */}
        <Route element={<PrivateRoute roles={['administrador', 'operador']} />}>
          <Route path="/dashboard/*" element={<DashboardLayout />} />
        </Route>

        {/* Redirección para rutas inexistentes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
