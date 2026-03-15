import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('access_token'));
  const [user,setUser]=useState(() => JSON.parse(sessionStorage.getItem('user_data')))
  const navigate=useNavigate()
  const login =(token)=>{
    setToken(token.access)
    sessionStorage.setItem('access_token',token.access)
    sessionStorage.setItem('refresh_token',token.refresh)
  }
  const logout =()=>{
    setToken(null)
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    sessionStorage.removeItem('user_data')
    setUser(null)
    navigate("/")
  }
  const isAdmin=user?.is_staff
  const addUser=(user)=>{
    sessionStorage.setItem('user_data',JSON.stringify(user))
    setUser(user)
  }

  // 4. Lo que exponemos al resto de la app
  const value = {
    token,
    isAuthenticated: !!token, // Devuelve true si hay token, false si no
    login,
    logout,
    user,
    addUser,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

