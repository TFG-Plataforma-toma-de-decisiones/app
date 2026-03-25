import { Route, Routes } from 'react-router-dom';
import Project from './components/project/Project';
import Navbar from './components/layout/Navbar';
import Home from './HomePage';
import Login from './components/auth/Login';
import { useAuth } from './hooks/useAuth';
import Configurator from './components/configurator/Configurator';
import FeatureTreesProvider from './context/FeatureTreesContext';
import './styles.css'; 
import UVLTreeEditor from './components/model/UVLTreeEditor';
import ConflictProjects from './components/project/ConflictProjects';

function App() {
  const { isAuthenticated } = useAuth();
  const types = ["Backend", "Frontend", "Full Stack"];
  const {isAdmin}=useAuth()
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
          <Route 
            path="/projects/:id" 
            element={
              <FeatureTreesProvider initialTrees={[{features: ["Project"]}]}>
                <Project />
              </FeatureTreesProvider>
            } 
          /> 
          {isAdmin && <Route path="/uvl-model" element={<UVLTreeEditor/>} />}
          {isAdmin && <Route path="conflicts-projects" element={<ConflictProjects/>}/>}
        </Routes>
      </main>
    </div>
  );
}

export default App;