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
            <option value="" disabled >Selecciona un lenguaje...</option>
            <option value="JavaScript">JavaScript / TypeScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="Csharp">C# / .NET</option>
            <option value="Php">PHP</option>
          </select>
      </div>
        <FeatureNode 
          node={uvlModel}
        />
      </div>
    );
  }