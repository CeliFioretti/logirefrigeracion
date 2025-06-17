import { Routes, Route, Navigate } from 'react-router-dom';

import Home from '../pages/AdminDashboard';
import Freezers from '../pages/Freezer';
import Clientes from '../pages/Clientes';
import Eventos from '../pages/Eventos';

function AdminRoutes() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/dashboard" element={<Home />} />
        <Route path="/freezers" element={<Freezers />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </DashboardLayout>
  );
}

export default AdminRoutes;
