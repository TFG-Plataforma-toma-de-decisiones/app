import { useState, useCallback } from "react";
import apiClient from "../services/api";
import { useGlobalError } from "./useGlobalError";
import { useNavigate } from "react-router-dom";

export default function useAction() {

  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useGlobalError();
  const navigate = useNavigate();

  const run = useCallback(async ({
    endpoint,
    method = "POST",
    body = null,
    params = null,
    navigateURL = null,
    updateState=null
  }) => {
    setIsLoading(true);

    try {

      const response = await apiClient({
        url: endpoint,
        method,
        data: body,
        params
      });

      if (navigateURL) navigate(navigateURL);
      const data=response.data
      if (updateState) {
        updateState(data)
     }

      return data;

    } catch (error) {
      showError(error.response?.data?.detail || "Error en la petición");

    } finally {
      setIsLoading(false);
    }

  }, [showError, navigate]);

  return { run, isLoading };
}