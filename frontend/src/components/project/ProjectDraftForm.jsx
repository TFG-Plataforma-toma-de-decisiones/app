import { useEffect } from 'react';
import './Project.css';
import FeatureNode from '../shared/FeatureNode';
import { useFeatureTrees } from '../../hooks/useFeatureTrees';

export default function ProjectDraftForm({ project, uvlModel, onSave, isLoading }) {
  const { setTrees, trees, getProperty } = useFeatureTrees();
  const index = 0;

  useEffect(() => {
    if (!project) {
      return;
    }
    setTrees([{
      ...project,
      features: [...(project.features || [])]
    }]);
  }, [project, setTrees]);

  if (!project) {
    return (
      <div className="form-container">
        <h2 className='project-name'>Resolución de conflictos</h2>
        <p className="project-description">
          No quedan proyectos inválidos. Si el borrador ya está correcto, puedes confirmarlo.
        </p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2 className='project-name'>Proyecto en conflicto</h2>

      {["name", "description"].map(property => (
        <div className='input-container' key={property}>
          <label className='label-input'>
            {property.charAt(0).toUpperCase() + property.slice(1)}
          </label>
          <div className="input-wrapper">
            <input
              className="input-text"
              value={getProperty(index, property) || ""}
              disabled
            />
          </div>
        </div>
      ))}

      <div className="input-container">
        <label className='label-input'>Language</label>
        <div className="input-wrapper">
          <input
            className="input-text"
            value={getProperty(index, "language") || ""}
            disabled
          />
        </div>
      </div>

      <FeatureNode node={uvlModel} readOnly={false} />

      <div className="submit-wrapper">
        <button className="submit-button" onClick={() => onSave(trees[0])} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar features'}
        </button>
      </div>
    </div>
  );
}
