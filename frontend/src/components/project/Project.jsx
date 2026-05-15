import './Project.css';
import FeatureNode from '../shared/FeatureNode';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { useFeatureTrees } from '../../hooks/useFeatureTrees';
import { useAuth } from '../../hooks/useAuth';
import useAction from '../../hooks/useAction';
import { BsMagic } from 'react-icons/bs';
import { useFeedback } from '../../hooks/useFeedback';
import usePollingAction from '../../hooks/usePollingAction';

export default function Project() {
    const { data: uvlModel, isLoading: isLoadingUvl } = useApi({ endpoint: "/model", initialData: {} })
    const { data: projects, isLoading: isLoadingProjects } = useApi({ endpoint: "/projects-name", initialData: [] })
    const { setTrees, setProperty, getProperty, trees } = useFeatureTrees()
    const { id } = useParams()
    const { data: languages, isLoading: isLoadingLanguages } = useApi({ endpoint: "/languages", initialData: [] })
    const { isAdmin } = useAuth()
    const { run, isLoading } = useAction()
    const { runPolling } = usePollingAction()
    const isNew = id === "new"
    const { showMessage } = useFeedback()
    const [projectLoaded, setProjectLoaded] = useState(isNew)

    const CONFIDENCE_THRESHOLDS = [
      {
        min: 0.5,
        max: 0.85,
        config: {
          type: 'warning',
          title: 'Revisión Manual Recomendada',
          message: 'Los datos iniciales eran ambiguos o escasos. La IA ha deducido la información basándose en el contexto disponible, pero es posible que haya inexactitudes. Por favor, revisa detalladamente las características marcadas.'
        }
      },
      {
        min: 0.0,
        max: 0.5,
        config: {
          type: 'error',
          title: 'Baja Fiabilidad',
          message: 'La información proporcionada no permitía identificar un proyecto real o contenía inconsistencias graves. Los datos generados son genéricos o por defecto. Es obligatorio descartar o reescribir este formulario completamente.'
        }
      }
    ];

    useEffect(() => {
      if (isNew) return;
      run({
        endpoint: `/projects/${id}`,
        method: "GET",
        updateState: (data) => {
          setTrees([data]);
          setProjectLoaded(true);
        }
      })
    }, [id, setTrees, run, isNew])

    const index = 0

    const isInitialLoading = !projectLoaded || isLoadingUvl || isLoadingLanguages

    async function handleSubmit() {
      await run({
        endpoint: '/projects' + (isNew ? "" : "/" + id),
        method: isNew ? "POST" : "PUT",
        body: trees[0],
        navigateURL: "/"
      });
    }

    async function handleAutocomplete() {
      const data = await runPolling({
        endpoint: '/autocomplete',
        statusEndpointBase: "/autocomplete-status",
        method: "POST",
        body: trees[0],
        updateState: (data => setTrees([data.project])),
      })
      if (!data) return;
      const confScore = data.confidence_score
      const level = CONFIDENCE_THRESHOLDS.find(s => confScore >= s.min && confScore < s.max)
      if (level) showMessage(level.config)
    }

    if (isInitialLoading) {
      return (
        <div className="form-container">
          <h2 className='project-name'>{isNew ? 'Nuevo Proyecto' : 'Proyecto'}</h2>
          <LoadingSpinner message="Cargando proyecto..." />
        </div>
      );
    }

    return (
      <div className="form-container">
        <h2 className='project-name'>{isNew ? 'Nuevo Proyecto' : 'Proyecto'}</h2>

        <div className='input-container'>
          <label className='label-input'>Nombre</label>
          <div className="input-wrapper">
            <input
              className="input-text"
              data-cy="project-name-input"
              value={getProperty(index, 'name') || ""}
              name="name"
              onChange={(e) => setProperty(index, 'name', e.target.value)}
              disabled={!isAdmin}
              placeholder="Escribe el nombre..."
            />
            {getProperty(index, 'name') && isAdmin && (
              <button className="autocompletar-btn" onClick={handleAutocomplete} data-cy="autocomplete-project">
                <BsMagic className="btn-icon" />
                <span>Autocompletar</span>
              </button>
            )}
          </div>
        </div>

        <div className='input-container'>
          <label className='label-input'>Descripción</label>
          <div className="input-wrapper">
            <textarea
              className="textarea-input"
              data-cy="project-description-input"
              value={getProperty(index, 'description') || ""}
              name="description"
              onChange={(e) => setProperty(index, 'description', e.target.value)}
              disabled={!isAdmin}
              placeholder="Escribe la descripción..."
            />
          </div>
        </div>

        <div className="input-container">
          <label className='label-input'>Lenguaje</label>
          <div className="input-wrapper">
            <input
              list="language-options"
              className="input-text"
              value={getProperty(index, "language") || ""}
              onChange={(e) => setProperty(index, "language", e.target.value)}
              disabled={!isAdmin}
              placeholder="Selecciona o escribe un lenguaje..."
            />
            <datalist id="language-options">
              {languages.map(l => (
                <option key={l.name} value={l.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="input-container">
          <label className='label-input'>Proyectos Compatibles</label>
          <div className="input-wrapper">
            {!isAdmin ? (
              <div className="chips-container">
                {getProperty(index, "compatible_projects")
                  ?.map(p => (
                    <span key={p} className="chip chip-selected readonly-chip">{p}</span>
                  ))}
                {!(getProperty(index, "compatible_projects") || []).length && (
                  <span className="no-data-text">Ningún proyecto seleccionado</span>
                )}
              </div>
            ) : (
              <div className="chips-container clickable-chips">
                {projects.map((p) => {
                  const currentCompatible = getProperty(index, "compatible_projects") || [];
                  const isSelected = currentCompatible.includes(p);
                  const toggleProject = () => {
                    const newCompatible = isSelected
                      ? currentCompatible.filter(comp => comp !== p)
                      : [...currentCompatible, p];
                    setProperty(index, "compatible_projects", newCompatible);
                  };
                  return (
                    <span
                      key={p}
                      className={`chip ${isSelected ? 'chip-selected' : 'chip-default'}`}
                      onClick={toggleProject}
                    >
                      {p}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <FeatureNode
          node={uvlModel}
          readOnly={!isAdmin}
        />

        {isAdmin && (
          <div className="submit-wrapper">
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={isLoading}
              data-cy="save-project"
            >
              {isLoading ? 'Guardando...' : 'Guardar Proyecto'}
            </button>
          </div>
        )}
      </div>
    );
}
