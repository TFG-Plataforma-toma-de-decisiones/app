import { 
    Box, 
    Typography,
    Paper,
    Button
  } from '@mui/material';
  import { styled } from '@mui/material/styles';
import { useUVLModel } from '../hooks/useUVLModel';
import FeatureNode from './FeatureNode';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { useGlobalError } from '../hooks/useGlobalError';
import { useState } from 'react';
const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
  }));
export default function Project() {
    const {uvlModel,features,setFeatures} =useUVLModel()
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
      <FormContainer elevation={0} component="form" >
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          {project.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
         {project.description}
        </Typography>
  
        <FeatureNode 
          node={uvlModel}
        />
  
      </FormContainer>
    );
  }