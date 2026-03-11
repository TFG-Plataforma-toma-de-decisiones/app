import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://192.168.1.149:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 10000, 
});


apiClient.interceptors.request.use(
  (config) => {

    const token = sessionStorage.getItem('access_token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expirado o inválido. Redirigiendo al login...");
    }
    return Promise.reject(error);
  }
);

export default apiClient;