import { Outlet } from 'react-router-dom';
import DashboardLayout  from '../layout/DashboardLayout';

function AdminRoutes() {
  return (
    <DashboardLayout>
      <Outlet/>
    </DashboardLayout>
  );
}

export default AdminRoutes;
