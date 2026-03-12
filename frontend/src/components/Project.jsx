import { 
    Box, 
    Typography,
    Paper,
    Button
  } from '@mui/material';
  import { styled } from '@mui/material/styles';
import { useUVLModel } from '../hooks/useUVLModel';
import FeatureNode from './FeatureNode';
const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
  }));
export default function Project() {
    const {uvlModel,features} =useUVLModel()
    
  
    
  
    const handleSubmit = (e) => {
      e.preventDefault();
      // Generamos el listado final para el backend
      
      console.log("Configuración a guardar:", features);
    };
  
    return (
      <FormContainer elevation={0} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          Proyecto
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configura los módulos de tu proyecto seleccionando las opciones deseadas.
        </Typography>
  
        <FeatureNode 
          node={uvlModel}
        />
  
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary" size="large">
            Guardar Configuración
          </Button>
        </Box>
      </FormContainer>
    );
  }