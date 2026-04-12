import { useEffect } from 'react';
import './Project.css';
import FeatureNode from '../shared/FeatureNode';
import { useFeatureTrees } from '../../hooks/useFeatureTrees';
import { addFeatureSubtree, getNodeMap, getRelations, removeFeatureSubtree } from '../../utils/featureModel';

export default function ProjectDraftForm({ project, uvlModel, onSave, isLoading }) {
  const { setTrees, trees, getProperty } = useFeatureTrees();
  const index = 0;

  useEffect(() => {
    if (!project) {
      return;
    }
    const nodeMap=getNodeMap(uvlModel,new Map())
    const newFeatures=project.features
      .filter(f=>nodeMap.has(f))
      .reduce((features,f)=>addFeatureSubtree(features,nodeMap.get(f)),[])
    const conflictAlternativeFeatures=[...nodeMap.values()]
      .flatMap(node=>getRelations(node))
      .filter(r=>r.type==="ALTERNATIVE" && r.children.filter(c=>newFeatures.includes(c.name)).length>1)
      .flatMap(r=>r.children)
    const filteredFeatures=conflictAlternativeFeatures.reduce(
      (features,feature)=>removeFeatureSubtree(features,feature),
      newFeatures
    )
    
    setTrees([{
      ...project,
      features: filteredFeatures
    }]);
  }, [project, setTrees,uvlModel]);
  
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

      
        <div className='input-container' >
          <label className='label-input'>
            {"Name"}
          </label>
          <div className="input-wrapper">
            <input
              className="input-text"
              data-cy="draft-project-name-input"
              value={getProperty(index, "name") || ""}
              disabled
            />
          </div>
        </div>


     

      <FeatureNode node={uvlModel} readOnly={false} />

      <div className="submit-wrapper">
        <button className="submit-button" onClick={() => onSave(trees[0])} disabled={isLoading} data-cy="save-draft-project">
          {isLoading ? 'Guardando...' : 'Guardar features'}
        </button>
      </div>
    </div>
  );
}
