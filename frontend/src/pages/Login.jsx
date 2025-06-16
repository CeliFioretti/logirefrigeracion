import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:3200/api/auth/login', {
        nombre,
        password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);

      // Redirección según rol
      if (data.rol === 'administrador') {
        navigate('/admin');
      } else {
        navigate('/operador');
      }
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <img src="../public/logo-negro-1.png" alt="Logo" className="logo" />
        <h2>Iniciar Sesión</h2>

        <label>Nombre de usuario:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="extra-options">
          <label>
            <input type="checkbox" /> Recuérdame
          </label>
          <a href="#">¿Olvidaste tu contraseña?</a>
        </div>

        <button type="submit">Entrar</button>
      </form>

      <footer>LogiRefrigeración para la empresa "Nombre de la Empresa"</footer>
    </div>
  );
}

export default Login;
