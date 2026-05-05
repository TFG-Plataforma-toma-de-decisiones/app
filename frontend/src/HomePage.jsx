import React from 'react';
import ProjectCard from './components/project/ProjectCard';
import SkeletonCard from './components/shared/SkeletonCard';
import useApi from './hooks/useApi';
import './Home.css';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { data: projects, setData: setProjects, refetch: refetchProjects, isLoading } = useApi({ endpoint: "/projects", initialData: [] });
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <div className="header-content">
          <h1 className="home-title">
            Open Source{' '}
            <span className="home-highlight">Stack Explorer</span>
          </h1>
          <p className="home-subtitle">
            Browse, compare, and find the perfect frameworks for your project.
          </p>
        </div>
        {isAdmin && (
          <button className="create-project-btn" onClick={() => navigate("projects/new")} data-cy="create-project">
            Crear Proyecto
          </button>
        )}
      </header>

      <div className="home-grid">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="home-grid-item">
                <SkeletonCard height={180} />
              </div>
            ))
          : projects.map((proj) => (
              <div key={proj.id} className="home-grid-item">
                <ProjectCard
                  project={proj}
                  setProjects={setProjects}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  deleteEndpoint={`projects/${proj.id}`}
                  refetchProjects={refetchProjects}
                />
              </div>
            ))
        }
      </div>
    </div>
  );
}

export default Home;
