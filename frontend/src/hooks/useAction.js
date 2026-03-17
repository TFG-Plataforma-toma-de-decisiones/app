import { useState, useCallback } from "react";
import apiClient from "../services/api";
import { useFeedback } from "./useFeedback";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function useAction() {
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage, hideMessage } = useFeedback(); 
  const navigate = useNavigate();
  const run = useCallback(async ({
    endpoint,
    method = "POST",
    body = null,
    params = null,
    navigateURL = null,
    updateState = null,
    showLoadingModal = false,
    loadingMessage = "Procesando..." 
  }) => {
    setIsLoading(true);
    const controller = new AbortController();
    if (showLoadingModal) {
      showMessage({
        title: "Por favor, espera",
        message: loadingMessage,
        type: "loading",
        onCancel: ()=>controller.abort()
      });
    }

    try {
      const response = await apiClient({
        url: endpoint,
        method,
        data: body,
        params,
        signal: controller.signal 
      });
      const data = response.data;
      if (navigateURL){
        navigate(navigateURL);
      } 
      if (updateState) {
        updateState(data);
      }
      if (showLoadingModal) {
        hideMessage();
      }
      return data;

    } catch (error) {
      if (axios.isCancel(error)) {
        hideMessage(); 
      } else {
        showMessage({
          message: error.response?.data?.detail || "Error en la petición",
          type: "error",
          title: "Ocurrió un error"
        });
      }
    } finally {
      setIsLoading(false);
    }

  }, [showMessage, hideMessage, navigate]);


 

  return { run, isLoading };
}