import './Project.css';
import { useUVLModel } from '../hooks/useUVLModel';
import FeatureNode from './FeatureNode';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { useGlobalError } from '../hooks/useGlobalError';
import { useState } from 'react';

export default function Project() {
    const {uvlModel,setFeatures} =useUVLModel()
    const {id}=useParams()
    const [project,setProject]=useState({})
    const {showError} =useGlobalError()

    useEffect(()=> {
      async function fetchProject(){
        try{
          const project=await apiClient.get(`/projects/${id}`)
          setFeatures(project.data.features)
          setProject(project.data)
        }
        catch(error){
          showError(error.response?.data?.detail || "Error al cargar los datos.");
        }
      }
      fetchProject()
    },[id,setFeatures,showError])
    
    return (
      <div className="form-container">
        <h1 className="project-name">{project.name}</h1>
        <p className="project-description">{project.description}</p>
        <FeatureNode 
          node={uvlModel}
        />
      </div>
    );
  }