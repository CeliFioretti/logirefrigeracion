import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://logirefrigeracion.onrender.com/api',
  headers: {
        'Content-Type': 'application/json',
    },
});

// Variables para almacenar las funciones de contexto y router
let logoutFunction;
let navigateFunction;

// Función para configurar los interceptores desde fuera
export const setupAxiosInterceptors = (logoutFn, navigateFn) => {
  logoutFunction = logoutFn;
  navigateFunction = navigateFn;

  // Interceptor de REQUEST (para añadir el token)
  instance.interceptors.request.use((config) => {
    const storedUser = sessionStorage.getItem('usuario');
    let token = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.token) {
          token = parsedUser.token;
        }
      } catch (e) {
        console.error("Error parsing user from sessionStorage in axios request interceptor:", e);
        sessionStorage.removeItem('usuario');
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Interceptor de RESPONSE (para manejar 401 Unauthorized)
  instance.interceptors.response.use(
    (response) => response, // Si la respuesta es exitosa, la devolvemos
    (error) => {
      // Si la respuesta es 401 Unauthorized
      if (error.response && error.response.status === 401) {
        console.warn("401 Unauthorized: Token probablemente vencido o inválido. Procesando redirección...");

      if (logoutFunction) {
        logoutFunction();
      }

      if (navigateFunction) {
        navigateFunction('/sesion-expirada', {replace: true})
      }
        

        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );
};

export default instance; 
