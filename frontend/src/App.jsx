import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OperadorDashboard from './pages/OperadorDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<PrivateRoute roles={['administrador']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<PrivateRoute roles={['operador']} />}>
          <Route path="/operador" element={<OperadorDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
