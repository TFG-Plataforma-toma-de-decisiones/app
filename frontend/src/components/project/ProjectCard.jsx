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

function ProjectCard({ project,setProjects }) {
  const navigate = useNavigate();
  const types=["Backend","Frontend","Full Stack","Backend Library","Frontend Library"]
  const type=types.find(t=>project.features.includes(t))
  const {isAdmin} =useAuth()
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const {run}=useAction()

  const handleDelete = (e) => {
    e.stopPropagation();
    setDeleteModalOpen(true);
  };

  const confirmDelete = async (e) => {
    e.stopPropagation();
    await run({endpoint:`projects/${project.id}`,method:"DELETE",
      updateState:()=>setProjects(projects=>projects.filter(p=>p.id!==project.id))})
    setDeleteModalOpen(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setDeleteModalOpen(false);
  };

  return (
    <>
      <div className="project-card" onClick={() => !isDeleteModalOpen && navigate(`/projects/${project.id}`)}>
        <div className="project-card-content">
          <div className="project-card-header">
            <h2 className="project-title">{project.name}</h2>
            {isAdmin && (
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
        title="Eliminar Proyecto"
      >
        <p>¿Estás seguro de que deseas eliminar el proyecto "{project.name}"? Esta acción no se puede deshacer.</p>
      </DeleteModal>
    </>
  );
}

export default ProjectCard;