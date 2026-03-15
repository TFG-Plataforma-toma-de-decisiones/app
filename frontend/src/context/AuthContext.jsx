import React, { createContext, useState } from 'react';
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('access_token'));
  const [user,setUser]=useState({})
  const login =(token)=>{
    setToken(token.access)
    sessionStorage.setItem('access_token',token.access)
    sessionStorage.setItem('refresh_token',token.refresh)
  }
  const logout =()=>{
    setToken(null)
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    setUser(null)
  }
  const isAdmin=user?.is_staff


  // 4. Lo que exponemos al resto de la app
  const value = {
    token,
    isAuthenticated: !!token, // Devuelve true si hay token, false si no
    login,
    logout,
    user,
    setUser,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

