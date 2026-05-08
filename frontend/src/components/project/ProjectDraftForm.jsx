import { useEffect, useState } from 'react';
import './Project.css';
import FeatureNode from '../shared/FeatureNode';
import { useFeatureTrees } from '../../hooks/useFeatureTrees';
import {
  addFeatureSubtree,
  getNodeMap,
  getRelations,
  removeFeatureSubtree,
} from '../../utils/featureModel';

export default function ProjectDraftForm({
  project,
  uvlModel,
  onSave,
  isLoading,
}) {
  const { setTrees, trees, getProperty } = useFeatureTrees();
  const index = 0;
  const [conflictInfo, setConflictInfo] = useState({ nonExistent: [], removed: [] });

  useEffect(() => {
    if (!project) {
      setConflictInfo({ nonExistent: [], removed: [] });
      return;
    }

    const nodeMap = getNodeMap(uvlModel, new Map());

    const nonExistent = project.features.filter((f) => !nodeMap.has(f));

    const newFeatures = project.features
      .filter((f) => nodeMap.has(f))
      .reduce(
        (features, f) => addFeatureSubtree(features, nodeMap.get(f).node),
        []
      );

    const conflictAlternativeFeatures = [...nodeMap.values()]
      .flatMap(({ node }) => getRelations(node))
      .filter(
        (r) =>
          r.type === 'ALTERNATIVE' &&
          r.children.filter((c) => newFeatures.includes(c.name)).length > 1
      )
      .flatMap((r) => r.children);

    const filteredConflictFeatures = conflictAlternativeFeatures.reduce(
      (features, feature) => removeFeatureSubtree(features, feature),
      newFeatures
    );

    const conflictMissingParentFeatures = filteredConflictFeatures.filter((f) => {
      let parent = nodeMap.get(f)?.parent;

      while (parent != null) {
        if (!filteredConflictFeatures.includes(parent)) {
          return true;
        }
        parent = nodeMap.get(parent)?.parent ?? null;
      }

      return false;
    });

    const filteredFeatures = conflictMissingParentFeatures.reduce(
      (features, feature) =>
        removeFeatureSubtree(features, nodeMap.get(feature).node),
      filteredConflictFeatures
    );

    const removed = project.features.filter(
      (f) => nodeMap.has(f) && !filteredFeatures.includes(f)
    );

    setConflictInfo({ nonExistent, removed });

    setTrees([
      {
        ...project,
        features: filteredFeatures,
      },
    ]);
  }, [project, uvlModel, setTrees]);

  if (!project) {
    return (
      <div className="form-container">
        <h2 className="project-name">Resolución de conflictos</h2>
        <p className="project-description">
          No quedan proyectos inválidos. Si el borrador ya está correcto, puedes
          confirmarlo.
        </p>
      </div>
    );
  }

  const hasConflicts = conflictInfo.nonExistent.length > 0 || conflictInfo.removed.length > 0;

  return (
    <div className="form-container">
      <h2 className="project-name">Proyecto en conflicto</h2>

      <div className="input-container">
        <label className="label-input">Name</label>
        <div className="input-wrapper">
          <input
            className="input-text"
            data-cy="draft-project-name-input"
            value={getProperty(index, 'name') || ''}
            disabled
          />
        </div>
      </div>

      {hasConflicts && (
        <div className="conflict-alert" data-cy="conflict-alert">
          <div className="conflict-alert-header">
            <span className="conflict-alert-icon">!</span>
            <strong>Features eliminadas automáticamente</strong>
          </div>

          {conflictInfo.nonExistent.length > 0 && (
            <div className="conflict-section">
              <p className="conflict-section-title">Ya no existen en el nuevo modelo:</p>
              <ul className="conflict-feature-list">
                {conflictInfo.nonExistent.map((f) => (
                  <li key={f} className="conflict-feature-tag conflict-tag-missing">{f}</li>
                ))}
              </ul>
            </div>
          )}

          {conflictInfo.removed.length > 0 && (
            <div className="conflict-section">
              <p className="conflict-section-title">Incompatibles con el nuevo modelo (selección inválida):</p>
              <ul className="conflict-feature-list">
                {conflictInfo.removed.map((f) => (
                  <li key={f} className="conflict-feature-tag conflict-tag-removed">{f}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="conflict-hint">Revisa el árbol de abajo, selecciona las features válidas y guarda.</p>
        </div>
      )}

      <FeatureNode node={uvlModel} readOnly={false} showLabel={false} />

      <div className="submit-wrapper">
        <button
          className="submit-button"
          onClick={() => onSave(trees[0])}
          disabled={isLoading}
          data-cy="save-draft-project"
        >
          {isLoading ? 'Guardando...' : 'Guardar features'}
        </button>
      </div>
    </div>
  );
}