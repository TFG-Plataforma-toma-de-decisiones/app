import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './HomePage';
import './App.css';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
function App() {
  const {isAuthenticated}=useAuth()
  return (

    
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/recomendador" element={<div>Página del Recomendador (En construcción)</div>} />
          {!isAuthenticated &&
          <Route path="/login" element={<Login/>} />
          }
          {/* Rutas de Administrador */}
          <Route path="/uvl-model" element={<div>Gestión del Modelo UVL</div>} />
          <Route path="/project/:id" element={<div>Detalle del Proyecto</div>} /> 
        </Routes>
      </main>
    </div>

  );
}

export default App;