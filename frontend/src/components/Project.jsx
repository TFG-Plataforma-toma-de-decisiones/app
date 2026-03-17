import './Project.css';
import FeatureNode from './FeatureNode';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { useFeatureTrees } from '../hooks/useFeatureTrees';
import { useAuth } from '../hooks/useAuth';
import useAction from '../hooks/useAction';
import { BsMagic } from 'react-icons/bs';

export default function Project() {
    const { data: uvlModel } = useApi({ endpoint: "/model", initialData: {} })
    const { setTrees, setProperty, getProperty, trees } = useFeatureTrees()
    const { id } = useParams()
    const { data: languages } = useApi({ endpoint: "/languages", initialData: [] })
    const { isAdmin } = useAuth()
    const { run, isLoading } = useAction()
    const isNew = id === "new"

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
      
      await run({
        endpoint: '/autocomplete',
        method: "POST",
        body: trees[0],
        updateState: (data => setTrees([data])),
        showLoadingModal:true
      })
      
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
                value={getProperty(index, property) || ""} 
                onChange={(e) => setProperty(index, property, e.target.value)} 
                disabled={!isAdmin} 
                placeholder={`Escribe el ${property}...`}
              />
              
              {property === 'name' && getProperty(index, 'name') && isAdmin && (
                <button className="autocompletar-btn" onClick={handleAutocomplete}>
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
            <button className="submit-button" onClick={handleSubmit}>Guardar Proyecto</button>
          </div>
        )}
      </div>
    );
}