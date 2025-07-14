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
            
          } else {
            
            sessionStorage.removeItem('usuario'); 
          }
        } else {
          console.log('UserContext: No hay usuario en sessionStorage.'); 
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
  };

  const logout = () => {
    setUsuario(null);
    sessionStorage.removeItem('usuario');
  };


  return (
    <UserContext.Provider value={{
      usuario,
      login,
      logout,
      loadingUser
    }}>
      {children}
    </UserContext.Provider>
  );
};
