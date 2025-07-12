import { parse } from 'date-fns';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); //Para indicar si el usuario se está cargando

  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = sessionStorage.getItem('usuario');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.token) {
            setUsuario(parsedUser);
          }
        }
      } catch (e) {
        console.error('Error al cargar usuario de sessionStorage:', e);
        sessionStorage.removeItem('usuario');
      } finally {
        setLoadingUser(false);
      }
    }

    loadUserFromStorage();
  }, []);

  const login = (data) => {
    setUsuario(data);
    sessionStorage.setItem('usuario', JSON.stringify(data));
    sessionStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUsuario(null);
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ usuario, login, logout, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};
