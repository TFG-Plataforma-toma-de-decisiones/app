import { useState, useCallback, useRef, useEffect } from "react";
import apiClient from "../services/api";
import { useFeedback } from "./useFeedback";

export default function usePollingAction() {
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage, hideMessage } = useFeedback();
  
  const pollingTimeoutRef = useRef(null);
  // Nuevo Ref para controlar el retraso del modal de carga
  const loadingMessageTimeoutRef = useRef(null); 

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
      if (loadingMessageTimeoutRef.current) clearTimeout(loadingMessageTimeoutRef.current);
    };
  }, []);

  const runPolling = useCallback(async ({
    endpoint,              
    statusEndpointBase,    
    body = null,
    updateState = null,
    loadingMessage = "Cargando ...",
    initialDelay = 300,    
    intervalTime = 2000,
    loadingDelay = 600     // <-- NUEVO: Espera 600ms antes de enseñar el modal
  }) => {
    setIsLoading(true);
    let isCancelled = false; 

    const handleCancel = () => {
      isCancelled = true;
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
      if (loadingMessageTimeoutRef.current) clearTimeout(loadingMessageTimeoutRef.current);
      hideMessage();
      setIsLoading(false);
      showMessage({ type: "info", message: "Generación cancelada." });
    };

    // 1. Programamos el modal de carga para que salga dentro de 600ms
    loadingMessageTimeoutRef.current = setTimeout(() => {
      if (!isCancelled) {
        showMessage({
          title: "Por favor, espera",
          message: loadingMessage,
          type: "loading",
          onCancel: handleCancel 
        });
      }
    }, loadingDelay);

    try {
      const response = await apiClient.post(endpoint, body);
      const taskId = response.data.task_id;

      if (!taskId) throw new Error("El servidor no devolvió un ID de tarea.");

      return new Promise((resolve, reject) => {
        
        const checkStatus = async () => {
          if (isCancelled) {
             reject(new Error("Cancelado por el usuario"));
             return;
          }

          try {
            const statusRes = await apiClient.get(`${statusEndpointBase}/${taskId}`);
            const status = statusRes.data.status;

            if (status === "SUCCESS") {
              // Si fue rápido (caché), cancelamos el timeout para que el modal no salga
              if (loadingMessageTimeoutRef.current) clearTimeout(loadingMessageTimeoutRef.current);
              
              hideMessage(); // Por si acaso ya había salido
              setIsLoading(false);
              
              if (updateState) updateState(statusRes.data); 
              resolve(statusRes.data);

            } else if (status === "FAILURE") {
              if (loadingMessageTimeoutRef.current) clearTimeout(loadingMessageTimeoutRef.current);
              hideMessage();
              setIsLoading(false);
              showMessage({ type: "error", title: "Error", message: "Error durante la petición." });
              reject(new Error("Celery task failed"));
              
            } else {
              // PENDING: Vuelve a comprobar en 2 segundos
              pollingTimeoutRef.current = setTimeout(checkStatus, intervalTime);
            }

          } catch (pollError) {
            if (loadingMessageTimeoutRef.current) clearTimeout(loadingMessageTimeoutRef.current);
            hideMessage();
            setIsLoading(false);
            showMessage({ type: "error", title: "Error de red", message: "Se perdió la conexión con el servidor." });
            reject(pollError);
          }
        };

        // Primera comprobación a los 300ms
        pollingTimeoutRef.current = setTimeout(checkStatus, initialDelay);
      });

    } catch (error) {
      if (loadingMessageTimeoutRef.current) clearTimeout(loadingMessageTimeoutRef.current);
      hideMessage();
      setIsLoading(false);
      showMessage({
        message: error.response?.data?.detail || "Error al iniciar la tarea",
        type: "error",
        title: "Ocurrió un error"
      });
      throw error;
    }

  }, [showMessage, hideMessage]);

  return { runPolling, isLoading };
}