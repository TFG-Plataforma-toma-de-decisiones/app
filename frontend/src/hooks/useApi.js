import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useNavigate } from "react-router-dom";
import { useFeedback } from "./useFeedback";
import axios from "axios";

export default function useApi({ 
  endpoint, 
  method = "GET", 
  initialData = null, 
  body = null, 
  params = null,
  autoFetch = method === "GET"
}) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const { showMessage, hideMessage } = useFeedback(); 
  const navigate = useNavigate();
  const fetchData = useCallback(
    async ({ 
      overrideBody = body, 
      navigateURL = null, 
      overrideMethod = method,
      showLoadingModal =false,
      loadingMessage = "Cargando datos..." 
    } = {}) => {
      setIsLoading(true);
      const controller = new AbortController();
      if (showLoadingModal) {
        showMessage({
          title: "Por favor, espera",
          message: loadingMessage,
          type: "loading",
          onCancel: () => controller.abort()
        });
      }
      try {
        const response = await apiClient({
          url: endpoint,
          method: overrideMethod,
          data: overrideBody,
          params,
          signal: controller.signal 
        });
        setData(response.data);
        if (navigateURL) navigate(navigateURL);
        if (showLoadingModal) {
          hideMessage(); 
        }
        return response.data;
      } catch (error) {
        if (axios.isCancel(error)) {
          if (showLoadingModal) hideMessage();
          return null;
        } else {
          showMessage({
            message: error.response?.data?.detail || "Error en la petición",
            type: "error",
            title: "Ocurrió un error"
          });
          return null;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, method, body, params, showMessage, hideMessage, navigate]
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