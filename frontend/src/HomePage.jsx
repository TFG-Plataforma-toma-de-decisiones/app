import React from 'react';
import ProjectCard from './components/ProjectCard';
import useApi from './hooks/useApi';
import './Home.css'; // Asegúrate de importar el CSS que creamos

function Home() {
  const { data: projects } = useApi({endpoint:"/projects",initialData:[]});

  return (
    <div className="home-wrapper">
      
      {/* Cabecera de la página */}
      <header className="home-header">
        <h1 className="home-title">
          Open Source{' '}
          <span className="home-highlight">
            Stack Explorer
          </span>
        </h1>
        
        <p className="home-subtitle">
          Browse, compare, and find the perfect frameworks for your project.
        </p>
      </header>

      {/* Grid de Proyectos */}
      <div className="home-grid">
        {projects.map((proj) => (
          <div key={proj.id} className="home-grid-item">
            <ProjectCard project={proj} />
          </div>
        ))}
      </div>
      
    </div>
  );
}

export default Home;