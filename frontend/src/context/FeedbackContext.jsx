import React, { createContext, useState, useCallback, useRef } from 'react';
import GenericModal from '../components/modals/GenericModal';

export const FeedbackContext = createContext();

export default function FeedbackProvider({ children }) {
  const [config, setConfig] = useState(null);
  const loadingTimeoutRef = useRef(null);
  const showMessage = useCallback((newConfig) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (newConfig?.type === 'loading') {
      loadingTimeoutRef.current = setTimeout(() => {
        setConfig(newConfig);
      }, 300);
    } else {
      setConfig(newConfig);
    }
  }, []);

  const hideMessage = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setConfig(null);
  }, []);

  return (
    <FeedbackContext.Provider value={{ showMessage, hideMessage }}>
      {children}
      <GenericModal 
        onClose={hideMessage} 
        config={config}
      />
    </FeedbackContext.Provider>
  );
}