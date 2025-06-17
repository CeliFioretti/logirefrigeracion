import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './components/Dashboard'; // Este decide qué layout usar según el rol
import PrivateRoute from './components/PrivateRoute';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<Login />} />

        {/* Dashboard general (admin u operador), protegido por roles */}
        <Route element={<PrivateRoute roles={['administrador', 'operador']} />}>
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Route>

        {/* Redirección para rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
