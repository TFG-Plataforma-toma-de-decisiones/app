import React, { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  // 1. Inicialización "Perezosa" (Lazy initialization)
  // Al cargar la app, miramos si ya había un token de antes del F5.
  const [token, setToken] = useState(() => sessionStorage.getItem('access_token'));
  // 2. Sincronización automática
  // Si el estado 'token' cambia (al hacer login o logout), actualizamos la memoria del navegador.
  useEffect(() => {
    if (token) {
      sessionStorage.setItem('access_token', token);
    } else {
      sessionStorage.removeItem('access_token'); // Limpieza al hacer logout
    }
  }, [token]);





  // 4. Lo que exponemos al resto de la app
  const value = {
    token,
    isAuthenticated: !!token, // Devuelve true si hay token, false si no
    setToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

