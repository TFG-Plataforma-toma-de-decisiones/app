// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { useGlobalError } from '../hooks/useGlobalError'; // Importamos el contexto de error

export default function useAxios(endpoint,initialData) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useGlobalError(); // Sacamos la función global

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Axios guarda la respuesta en .data
      const response = await apiClient.get(endpoint);
      setData(response.data);
    } catch (error) {
      // ¡El Hook maneja el error por ti!
      showError(error.response?.data?.detail || "Error al cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data,setData, isLoading, refetch: fetchData };
}