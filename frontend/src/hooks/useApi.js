import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useGlobalError } from "./useGlobalError";
import { useNavigate } from "react-router-dom";
export default function useApi({ 
  endpoint, 
  method = "GET", 
  initialData = null, 
  body = null, 
  params = null,
  autoFetch = method==="GET"
}) {

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const { showError } = useGlobalError();
  const navigate=useNavigate()
  const fetchData = useCallback(
    async ({ overrideBody = body, navigateURL = null, overrideMethod = method } = {}) => {
      setIsLoading(true);
  
      try {
        const response = await apiClient({
          url: endpoint,
          method: overrideMethod,
          data: overrideBody,
          params
        });
  
        setData(response.data);
  
        if (navigateURL) navigate(navigateURL);
  
        return response.data;
      } catch (error) {
        showError(error.response?.data?.detail || "Error en la petición");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, method, body, params, showError, navigate]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    setData,
    isLoading,
    refetch: fetchData
  };
}