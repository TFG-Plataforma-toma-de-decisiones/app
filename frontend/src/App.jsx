import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './HomePage';
import './App.css';
import AuthProvider from './context/AuthContext'
import ErrorProvider from './context/ErrorContext';
import Login from './components/Login';
function App() {
 
  return (
    <ErrorProvider>
    <AuthProvider>
    
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/recomendador" element={<div>Página del Recomendador (En construcción)</div>} />
          <Route path="/login" element={<Login/>} />

          {/* Rutas de Administrador */}
          <Route path="/uvl-model" element={<div>Gestión del Modelo UVL</div>} />
          <Route path="/project/:id" element={<div>Detalle del Proyecto</div>} /> 
        </Routes>
      </main>
    </div>
    </AuthProvider>
    </ErrorProvider>
  );
}

export default App;