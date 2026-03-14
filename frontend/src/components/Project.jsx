import './Project.css';
import FeatureNode from './FeatureNode';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { useGlobalError } from '../hooks/useGlobalError';
import useApi from '../hooks/useApi';
import { useFeatureTrees } from '../hooks/useFeatureTrees';

export default function Project() {
    const {data:uvlModel}=useApi({endpoint:"/model",initialData:{}})
    const {setTrees,setProperty,getProperty}=useFeatureTrees([{features:[]}])
    const {id}=useParams()
    const {showError} =useGlobalError()
    const {data:languages}=useApi({endpoint:"/languages",initialData:[]})
    useEffect(()=> {
      async function fetchProject(){
        try{
          const project=await apiClient.get(`/projects/${id}`)
          setTrees([project.data])
        }
        catch(error){
          showError(error.response?.data?.detail || "Error al cargar los datos.");
        }
      }
      fetchProject()
    },[id,setTrees,showError])
    const index=0
    return (
      <div className="form-container">
        <h1 className="project-name">{getProperty(index,"name")}</h1>
        <p className="project-description">{getProperty(index,"description")}</p>
        <div className="language-dropdown-container">
        <select 
            className="language-select"
            value={getProperty(index,"language")}
            onChange={(e)=>setProperty(index,"language",e.target.value)}
          >
            <option value="" >Selecciona un lenguaje...</option>
            {languages.map(l=>(
                <option value={l.name}>{l.name}</option>
            ))}
            
          </select>
      </div>
        <FeatureNode 
          node={uvlModel}
        />
      </div>
    );
  }