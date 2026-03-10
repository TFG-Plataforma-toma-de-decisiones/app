import React, { createContext, useState, useCallback } from 'react';
import ErrorModal from '../components/ErrorModal'; // Importamos tu componente visual

export const ErrorContext = createContext();

export default function ErrorProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = useCallback((message) => {
    setErrorMessage(message);
    setIsOpen(true);
  }, []);

  const hideError = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setErrorMessage(''), 200); // Limpieza suave para la animación
  }, []);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      
      {/* ¡LA CLAVE ESTÁ AQUÍ! 
          El modal vive en la raíz de la app. Nadie más tiene que importarlo. */}
      <ErrorModal 
        isOpen={isOpen} 
        errorMessage={errorMessage} 
        onClose={hideError} 
        title="Error del Servidor"
      />
    </ErrorContext.Provider>
  );
}

