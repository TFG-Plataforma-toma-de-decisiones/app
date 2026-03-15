import { Route, Routes } from 'react-router-dom';
import Project from './components/Project';
import Navbar from './components/Navbar';
import Home from './HomePage';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
import Configurator from './components/Configurator';
import FeatureTreesProvider from './context/FeatureTreesContext';
import './styles.css'; 

function App() {
  const { isAuthenticated } = useAuth();
  const types = ["Backend", "Frontend", "Full Stack"];
  
  return (
    <div className="app-wrapper">
      <Navbar />
      
      <main className="main-content">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route 
            path="/recomendador" 
            element={
              <FeatureTreesProvider initialTrees={types.map((t) => ({features: [], type: t}))}>
                <Configurator />
              </FeatureTreesProvider>
            } 
          />
          
          {!isAuthenticated && (
            <Route path="/login" element={<Login />} />
          )}
          
          {/* Rutas de Administrador */}
          <Route path="/uvl-model" element={<div>Gestión del Modelo UVL</div>} />
          <Route 
            path="/projects/:id" 
            element={
              <FeatureTreesProvider initialTrees={[{features: []}]}>
                <Project />
              </FeatureTreesProvider>
            } 
          /> 
        </Routes>
      </main>
    </div>
  );
}

export default App;