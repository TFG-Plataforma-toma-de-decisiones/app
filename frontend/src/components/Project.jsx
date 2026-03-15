import './Project.css';
import FeatureNode from './FeatureNode';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalError } from '../hooks/useGlobalError';
import useApi from '../hooks/useApi';
import { useFeatureTrees } from '../hooks/useFeatureTrees';
import { useAuth } from '../hooks/useAuth';
import useAction from '../hooks/useAction';

export default function Project() {
    const {data:uvlModel}=useApi({endpoint:"/model",initialData:{}})
    const {setTrees,setProperty,getProperty,trees}=useFeatureTrees([{features:[]}])
    const {id}=useParams()
    const {showError} =useGlobalError()
    const {data:languages}=useApi({endpoint:"/languages",initialData:[]})
    const {isAdmin}=useAuth()
    const {run}=useAction()
    useEffect(()=> {
      run({endpoint:`/projects/${id}`,method:"GET",updateState:(data)=>setTrees([data])})
    },[id,setTrees,run])
    const index=0
    async function handleSubmit(){
      await run({endpoint:`/projects/${id}`,method:"PUT",updateState:(data)=>setTrees([data]),body:trees[0],navigateURL:"/"})
    }
    return (
      <div className="form-container">
        <h2 className='project-name'>Project</h2>
        {["name","description"].map(property=>(
          <div className='input-container'>
            <label className='label-input'>{property}</label>
            <input className="input-text" value={getProperty(index,property) || ""} onChange={(e)=>setProperty(index,property,e.target.value)} disabled={!isAdmin}/>

          </div>
        ))}      
        <div className="input-container">
        <label className='label-input'>Language</label>
        <select 
            className="language-select"
            value={getProperty(index,"language")}
            onChange={(e)=>setProperty(index,"language",e.target.value)}
            disabled={!isAdmin}
          >
            <option value="" >Selecciona un lenguaje...</option>
            {languages.map(l=>(
                <option value={l.name}>{l.name}</option>
            ))}
            
          </select>
      </div>
        <FeatureNode 
          node={uvlModel}
          readOnly={!isAdmin}
        />
        {isAdmin && <button className="submit-button" onClick={handleSubmit}>Guardar</button>}
      </div>
    );
  }