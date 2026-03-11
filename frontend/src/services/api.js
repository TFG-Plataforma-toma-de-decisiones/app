import axios from 'axios';
const baseURL=import.meta.env.VITE_API_URL
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. INTERCEPTOR DE PETICIÓN (El que ya teníamos)
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. INTERCEPTOR DE RESPUESTA (¡La nueva magia para el Refresh!)
apiClient.interceptors.response.use(
  (response) => {
    // Si la petición va bien, simplemente la devolvemos
    return response;
  },
  async (error) => {
    // Guardamos la petición original que acaba de fallar
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos para no entrar en un bucle infinito

      try {
        const refreshToken = sessionStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error("No hay refresh token disponible");
        }
        const response = await axios.post(`${baseURL}/refresh`, {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        sessionStorage.setItem('access_token', newAccessToken);

        if (response.data.refresh) {
          sessionStorage.setItem('refresh_token', response.data.refresh);
        }

 
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);

export default apiClient;