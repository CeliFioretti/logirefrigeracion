// src/layout/DashboardLayout.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

import SideNav from '../components/SideNav';
import TopBarAdmin from '../components/TopBarAdmin';

const drawerWidth = 300;


function DashboardLayout() {
  const navigate = useNavigate();
  const { usuario } = useContext(UserContext);
  const rol = usuario ? usuario.rol : null; // Accede al rol a través del objeto usuario

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md')); // Determina si la pantalla es lo suficientemente grande para el SideNav (desktop)

  // Estado para el Sidenav en pantallas grandes (colapsable)
  const [sideNavOpen, setSideNavOpen] = useState(false);

  // Estado del Drawer superior en pantallas pequeñas
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Funcion para alternar el SideNav en pantallas grandes
  const handleSideNavToggle = () => {
    setSideNavOpen(!sideNavOpen);
  }

  // Funcion para alternar el Drawer en pantallas pequeñas
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  // Si no hay un usuario, el sistema redirige al login
  useEffect(() => {
    if (!usuario) {
      navigate('/', { replace: true });
    }
  }, [usuario, navigate]);

  // Condiciona el titulo de la pagina segun el rol
  useEffect(() => {
    if (usuario?.rol === 'administrador') {
      document.title = 'Dashboard Admin - LogiRefrigeración';
    } else if (usuario?.rol === 'operador') {
      document.title = 'Dashboard Operador - LogiRefrigeración';
    } else {
      document.title = 'Dashboard - LogiRefrigeración';
    }
  }, [usuario?.rol]);


  // Si no hay usuario no se renderiza para evitar flashes
  if (!usuario) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/** El TopBarAdmin siempre visible */}
      <TopBarAdmin
        toggleSideNav={handleSideNavToggle} // Para el botón hamburguesa en tamaño grande
        toggleMobileMenu={handleMobileMenuToggle} // Para el botón hamburguesa en tamaño pequeño
        isLargeScreen={isLargeScreen} // Para que el TopBarAdmin sepa que boton hamburguesa mostrar y qué acción ejecutar de arriba
        mobileMenuOpen={mobileMenuOpen} // Estado del Drawer móvil en TopBarAdmin
        drawerWidth={drawerWidth} // Pasa el ancho para el Drawer, pero se usa de otra forma
      />

      {/** Solo se renderiza si está en pantallas grandes */}
      {isLargeScreen && (
        <SideNav
          open={sideNavOpen} // Para controlar si el SideNav está abierto
          toggleDrawer={handleSideNavToggle} // Para cerrar el Sidenav
          drawerWidth={drawerWidth} // Para el ancho del Sidenav
        />
      )}

      {/** Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          marginLeft: 0,
          transition: 'margin 0.3s',
          width: '100%'
        }}
      >
        <Toolbar />
        
        <Outlet/>

      </Box>
    </Box>
  );
}

export default DashboardLayout;