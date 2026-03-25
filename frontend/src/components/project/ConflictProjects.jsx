import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import useAction from '../../hooks/useAction';
import ProjectCard from './ProjectCard';
import ProjectDraftForm from './ProjectDraftForm';
import './ConflictProjects.css';
import FeatureTreesProvider from '../../context/FeatureTreesContext';
export default function ConflictProjects() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const { data: uvlModel, isLoading: isLoadingModel } = useApi({ endpoint: "/manage-uvl", initialData: {} });
  const {
    data: invalidProjects,
    setData:setInvalidProjects,
    refetch: refetchDraft,
    isLoading: isLoadingDraft
  } = useApi({ endpoint: "/projects/draft", initialData: [] });
  const { run, isLoading } = useAction();
  const initialDraftTrees=useMemo(()=>[{features:[]}],[])
  async function handleSave(projectData) {
    if (!selectedProject) {
      return;
    }
    const data = await run({
      endpoint: `/projects/${selectedProject.id}/draft`,
      method: "PUT",
      body: projectData
    });
    if (data) {
      await refetchDraft();
    }
  }
  useEffect(()=>{
    if(invalidProjects.length===0){
      return ;
    }
    setSelectedProject(invalidProjects[0])
  },[setSelectedProject,invalidProjects])

  async function handleDeleteSuccess() {
    await refetchDraft();
  }

  async function handleConfirm() {
    await run({
      endpoint: "/manage-uvl",
      method: "PUT",
      navigateURL: "/"
    });
  }

  async function handleDiscard() {
    await run({
      endpoint: "/manage-uvl",
      method: "DELETE",
      navigateURL: "/uvl-model"
    });
  }

  if (isLoadingDraft || isLoadingModel) {
    return (
      <div className="conflicts-page">
        <div className="conflicts-empty">
          <h2>Cargando borrador</h2>
          <p>Estamos recuperando el UVL draft y sus proyectos conflictivos.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="conflicts-page">
      <div className="conflicts-header">
        <div>
          <h1 className="conflicts-title">Conflictos del modelo UVL</h1>
          <p className="conflicts-subtitle">
            {invalidProjects.length >0
              ? `Hay ${invalidProjects.length} proyecto(s) inválido(s). Corrige sus features o márcalos para borrar antes de confirmar el borrador.`
              : 'Todos los proyectos ya son válidos. Puedes confirmar el borrador cuando quieras.'}
          </p>
        </div>
        <div className="conflicts-actions">
          <button className="secondary-button" onClick={handleDiscard} disabled={isLoading}>
            Descartar borrador
          </button>
          <button className="submit-button" onClick={handleConfirm} disabled={invalidProjects.length>0 || isLoading}>
            Confirmar cambios
          </button>
        </div>
      </div>

      <div className="conflicts-layout">
        <aside className="conflicts-sidebar">
          <div className="conflicts-sidebar-header">
            <h2>Proyectos en conflicto</h2>
            <span className={`conflicts-count ${invalidProjects.length===0 ? 'ready' : ''}`}>
              {invalidProjects.length}
            </span>
          </div>

          <div className="conflicts-list">
            {invalidProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
                deleteEndpoint={`projects/${project.id}/draft`}
                setProjects={setInvalidProjects}
              />
            ))}

            {invalidProjects.length===0 && (
              <div className="conflicts-ready">
                <h3>Sin conflictos pendientes</h3>
                <p>Ya puedes confirmar el nuevo UVL y persistir todos los cambios del borrador.</p>
              </div>
            )}
          </div>
        </aside>

        <section className="conflicts-editor">
        <FeatureTreesProvider initialTrees={initialDraftTrees}>
          <ProjectDraftForm
            project={selectedProject}
            uvlModel={uvlModel}
            onSave={handleSave}
            isLoading={isLoading}
          />
          </FeatureTreesProvider>
        </section>
      </div>
    </div>
  );
}
