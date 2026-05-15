import React, { useState, useMemo } from 'react';
import ProjectCard from './components/project/ProjectCard';
import SkeletonCard from './components/shared/SkeletonCard';
import useApi from './hooks/useApi';
import './Home.css';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const PROJECT_TYPES = ['Backend', 'Frontend', 'Full Stack', 'Backend Library', 'Frontend Library'];

const TYPE_COLOR = {
  'Backend': 'primary',
  'Frontend': 'secondary',
  'Full Stack': 'warning',
  'Backend Library': 'info',
  'Frontend Library': 'info',
};

function Home() {
  const { data: projects, setData: setProjects, refetch: refetchProjects, isLoading } = useApi({ endpoint: "/projects", initialData: [] });
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const languages = useMemo(() => {
    const langs = [...new Set(projects.map(p => p.language).filter(Boolean))];
    return langs.sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesLanguage = !selectedLanguage || p.language === selectedLanguage;
      const matchesType = !selectedType || p.features.includes(selectedType);
      return matchesSearch && matchesLanguage && matchesType;
    });
  }, [projects, search, selectedLanguage, selectedType]);

  const toggleType = (type) => {
    setSelectedType(prev => prev === type ? '' : type);
  };

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

      <div className="home-filters">
        <div className="home-filters-row">
          <input
            type="text"
            className="input-text home-search"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="home-language-select"
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
          >
            <option value="">Todos los lenguajes</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div className="home-type-chips">
          {PROJECT_TYPES.map(type => (
            <button
              key={type}
              className={`filter-chip filter-chip--${TYPE_COLOR[type]}${selectedType === type ? ' filter-chip--active' : ''}`}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="home-grid">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="home-grid-item">
                <SkeletonCard height={180} />
              </div>
            ))
          : filteredProjects.length > 0
            ? filteredProjects.map((proj) => (
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
            : (
              <p className="home-no-results">No se encontraron proyectos con los filtros aplicados.</p>
            )
        }
      </div>
    </div>
  );
}

export default Home;
