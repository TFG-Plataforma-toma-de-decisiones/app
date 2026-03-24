import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import useAction from '../../hooks/useAction';
import ProjectCard from './ProjectCard';
import ProjectDraftForm from './ProjectDraftForm';
import './ConflictProjects.css';

const EMPTY_DRAFT = {
  has_draft: false,
  invalid_projects: [],
  pending_deletions: [],
  pending_updates: [],
  can_confirm: false
};

export default function ConflictProjects() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const { data: uvlModel, isLoading: isLoadingModel } = useApi({ endpoint: "/manage-uvl", initialData: {} });
  const {
    data: draftData,
    refetch: refetchDraft,
    isLoading: isLoadingDraft
  } = useApi({ endpoint: "/projects/draft", initialData: EMPTY_DRAFT });
  const { run, isLoading } = useAction();

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
    if(draftData.invalid_projects.length===0){
      return ;
    }
    setSelectedProject(draftData.invalid_projects[0])
  },[setSelectedProject,draftData])

  async function handleDeleteSuccess() {
    await refetchDraft();
  }

  async function handleConfirm() {
    await run({
      endpoint: "/manage-uvl",
      method: "POST",
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

  if (!draftData.has_draft) {
    return (
      <div className="conflicts-page">
        <div className="conflicts-empty">
          <h2>No hay un borrador activo</h2>
          <p>Cuando un cambio de UVL deje proyectos inválidos, aparecerán aquí para resolverlos.</p>
          <button className="submit-button" onClick={() => navigate('/uvl-model')}>
            Volver al editor UVL
          </button>
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
            {draftData.invalid_projects?.length
              ? `Hay ${draftData.invalid_projects?.length} proyecto(s) inválido(s). Corrige sus features o márcalos para borrar antes de confirmar el borrador.`
              : 'Todos los proyectos ya son válidos. Puedes confirmar el borrador cuando quieras.'}
          </p>
        </div>
        <div className="conflicts-actions">
          <button className="secondary-button" onClick={handleDiscard} disabled={isLoading}>
            Descartar borrador
          </button>
          <button className="submit-button" onClick={handleConfirm} disabled={!draftData.can_confirm || isLoading}>
            Confirmar cambios
          </button>
        </div>
      </div>

      <div className="conflicts-layout">
        <aside className="conflicts-sidebar">
          <div className="conflicts-sidebar-header">
            <h2>Proyectos en conflicto</h2>
            <span className={`conflicts-count ${draftData.can_confirm ? 'ready' : ''}`}>
              {draftData.invalid_projects?.length}
            </span>
          </div>

          <div className="conflicts-list">
            {draftData.invalid_projects?.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
                isSelected={project.id === selectedProject?.id}
                deleteEndpoint={`projects/${project.id}/draft`}
                deleteTitle="Marcar proyecto para borrado"
                deleteMessage={`¿Quieres marcar "${project.name}" para borrarlo cuando confirmes el borrador?`}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}

            {!draftData.invalid_projects?.length && (
              <div className="conflicts-ready">
                <h3>Sin conflictos pendientes</h3>
                <p>Ya puedes confirmar el nuevo UVL y persistir todos los cambios del borrador.</p>
              </div>
            )}
          </div>
        </aside>

        <section className="conflicts-editor">
          <ProjectDraftForm
            project={selectedProject}
            uvlModel={uvlModel}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </section>
      </div>
    </div>
  );
}
