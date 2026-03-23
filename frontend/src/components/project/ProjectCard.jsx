import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';
import { useAuth } from '../../hooks/useAuth';
import DeleteModal from '../modals/DeleteModal';
import useAction from '../../hooks/useAction';
import { FaTrash } from 'react-icons/fa';

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

function ProjectCard({
  project,
  setProjects,
  onClick,
  isSelected = false,
  deleteEndpoint,
  onDeleteSuccess,
  deleteTitle = "Eliminar Proyecto",
  deleteMessage
}) {
  const navigate = useNavigate();
  const types = ["Backend", "Frontend", "Full Stack", "Backend Library", "Frontend Library"];
  const type = types.find(t => project.features.includes(t));
  const { isAdmin } = useAuth();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const { run } = useAction();

  const handleDelete = (e) => {
    e.stopPropagation();
    setDeleteModalOpen(true);
  };

  const confirmDelete = async (e) => {
    e.stopPropagation();
    const data = await run({
      endpoint: deleteEndpoint || `projects/${project.id}`,
      method: "DELETE",
      updateState: !onDeleteSuccess && setProjects
        ? () => setProjects(projects => projects.filter(p => p.id !== project.id))
        : null
    });
    if (data === undefined) {
      return;
    }
    if (data && onDeleteSuccess) {
      await onDeleteSuccess(data, project);
    }
    setDeleteModalOpen(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setDeleteModalOpen(false);
  };

  const handleCardClick = () => {
    if (isDeleteModalOpen) {
      return;
    }
    if (onClick) {
      onClick(project);
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <div className={`project-card ${isSelected ? 'selected' : ''}`} onClick={handleCardClick}>
        <div className="project-card-content">
          <div className="project-card-header">
            <h2 className="project-title">{project.name}</h2>
            {isAdmin && (deleteEndpoint || setProjects) && (
              <button onClick={handleDelete} className="delete-project-btn">
                <FaTrash />
              </button>
            )}
          </div>
          <div className="tags-container">
            <span className={`chip ${getChipColor(type)}`}>
              {formatLabel(type)}
            </span>
          </div>
          <p className="project-description">{project.description}</p>
        </div>
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={deleteTitle}
      >
        <p>{deleteMessage || `¿Estás seguro de que deseas eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`}</p>
      </DeleteModal>
    </>
  );
}

export default ProjectCard;
