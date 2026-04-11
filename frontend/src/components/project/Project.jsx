import './Project.css';
import FeatureNode from '../shared/FeatureNode';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { useFeatureTrees } from '../../hooks/useFeatureTrees';
import { useAuth } from '../../hooks/useAuth';
import useAction from '../../hooks/useAction';
import { BsMagic } from 'react-icons/bs';
import { useFeedback } from '../../hooks/useFeedback';
import usePollingAction from '../../hooks/usePollingAction';

export default function Project() {
    const { data: uvlModel } = useApi({ endpoint: "/model", initialData: {} })
    const { setTrees, setProperty, getProperty, trees } = useFeatureTrees()
    const { id } = useParams()
    const { data: languages } = useApi({ endpoint: "/languages", initialData: [] })
    const { isAdmin } = useAuth()
    const { run, isLoading } = useAction()
    const {runPolling}=usePollingAction()
    const isNew = id === "new"
    const {showMessage}=useFeedback()
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
      if(isNew){
        return ;
      }
      run({ endpoint: `/projects/${id}`, method: "GET", updateState: (data) => setTrees([data]) })
    }, [id, setTrees, run, isNew])
    
    const index = 0

    async function handleSubmit() {
      await run({
        endpoint: '/projects' + (isNew ? "" : "/" + id),
        method: isNew ? "POST" : "PUT",
        body: trees[0],
        navigateURL: "/"
      });
    }

    async function handleAutocomplete() {
      
      const data=await runPolling({
        endpoint: '/autocomplete',
        statusEndpointBase:"/autocomplete-status",
        method: "POST",
        body: trees[0],
        updateState: (data => setTrees([data.project])),
      })
      if(!data){
        return ;
      }
      const confScore=data.confidence_score
      const level=CONFIDENCE_THRESHOLDS.find(s=>confScore>=s.min && confScore<s.max)
      if(level){
        showMessage(level.config)
      }
      
    }

    return (
      <div className="form-container">
        <h2 className='project-name'>{isNew ? 'Nuevo Proyecto' : 'Proyecto'}</h2>
        
        {["name", "description"].map(property => (
          <div className='input-container' key={property}> 
            <label className='label-input'>
              {property.charAt(0).toUpperCase() + property.slice(1)}
            </label>
            <div className="input-wrapper">
              <input 
                className="input-text" 
                data-cy={`project-${property}-input`}
                value={getProperty(index, property) || ""} 
                name={property}
                onChange={(e) => setProperty(index, property, e.target.value)} 
                disabled={!isAdmin} 
                placeholder={`Escribe el ${property}...`}
              />
              
              {property === 'name' && getProperty(index, 'name') && isAdmin && (
                <button className="autocompletar-btn" onClick={handleAutocomplete} data-cy="autocomplete-project">
                  <BsMagic className="btn-icon" />
                  <span>Autocompletar</span>
                </button>
              )}
              {isLoading && property === "name" && <span className='loading-text'>Cargando...</span>}
            </div>
          </div>
        ))}      
        

        <div className="input-container">
          <label className='label-input'>Language</label>
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

        <FeatureNode 
          node={uvlModel}
          readOnly={!isAdmin}
        />
        
        {isAdmin && (
          <div className="submit-wrapper">
            <button className="submit-button" onClick={handleSubmit} data-cy="save-project">Guardar Proyecto</button>
          </div>
        )}
      </div>
    );
}
