import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

const getChipColor = (category) => {
  if (!category) return 'default';
  const cat = category.toLowerCase();
  if (cat.includes('backend')) return 'primary';
  if (cat.includes('frontend')) return 'secondary';
  if (cat.includes('full')) return 'warning';
  if (cat.includes('library')) return 'info';
  return 'default';
};

const formatLabel = (label) => {
  if (!label) return '';
  return label
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
      <div className="project-card-content">
        <h2 className="project-title">{project.name}</h2>
        <div className="tags-container">
          <span className={`chip ${getChipColor(project.type)}`}>
            {formatLabel(project.type)}
          </span>
          {project.features && project.features.map((label) => (
            <span key={label} className="chip outlined">
              {formatLabel(label)}
            </span>
          ))}
        </div>
        <p className="project-description">{project.description}</p>
      </div>
    </div>
  );
}

export default ProjectCard;