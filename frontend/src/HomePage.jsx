import React from 'react';
import ProjectCard from './components/ProjectCard';
import useApi from './hooks/useApi';
import './Home.css'; // Asegúrate de importar el CSS que creamos
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { data: projects,setData:setProjects } = useApi({endpoint:"/projects",initialData:[]});
  const {isAdmin}=useAuth()
  const navigate=useNavigate()

  return (
    <div className="home-wrapper">
      
      {/* Cabecera de la página */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="home-title">
            Open Source{' '}
            <span className="home-highlight">
              Stack Explorer
            </span>
          </h1>
          <p className="home-subtitle">
            Browse, compare, and find the perfect frameworks for your project.
          </p>
        </div>
        {isAdmin && (
          <button className="create-project-btn" onClick={()=>navigate("projects/new")}>
            Crear Proyecto
          </button>
        )}
      </header>

      {/* Grid de Proyectos */}
      <div className="home-grid">
        {projects.map((proj) => (
          <div key={proj.id} className="home-grid-item">
            <ProjectCard project={proj} setProjects={setProjects}/>
          </div>
        ))}
      </div>
      
    </div>
  );
}

export default Home;