import React, { createContext, useState, useCallback } from 'react';
import GenericModal from '../components/GenericModal';

export const FeedbackContext = createContext();

export default function FeedbackProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState();

  const showMessage = useCallback((config) => {
    setConfig(config);
    setIsOpen(true);
  }, []);

  const hideMessage = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setConfig({ title: '', message: '', type: '' }), 200);
  }, []);

  return (
    <FeedbackContext.Provider value={{ showMessage,hideMessage }}>
      {children}
      <GenericModal 
        isOpen={isOpen} 
        onClose={hideMessage} 
        config={config}
      />
    </FeedbackContext.Provider>
  );
}