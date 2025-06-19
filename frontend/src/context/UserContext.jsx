import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
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
    <UserContext.Provider value={{ usuario, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
