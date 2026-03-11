import { Card, CardActionArea, CardContent, Typography, Box, Chip } from '@mui/material';
import './ProjectCard.css';

// Función para obtener el color del Chip basado en la categoría
const getChipColor = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('backend')) return 'primary';
  if (cat.includes('frontend')) return 'secondary';
  if (cat.includes('full')) return 'warning';
  if (cat.includes('library')) return 'info';
  return 'default';
};

// Función para capitalizar y limpiar el slug
const formatLabel = (label) => {
    return label
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

function ProjectCard({ project }) {
  

  return (
    <Card variant="outlined" className="project-card-root">
      <CardActionArea className="card-action-area" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardContent className="card-content-flex">
          
          <Typography variant="h6" component="h2" className="project-title">
            {project.name}
          </Typography>
          
          <Box className="tags-container">
              <Chip 
                  label={formatLabel(project.type)} 
                  color={getChipColor(project.type)}
                  size="small"
                  className="chip-main"
              />
              {/*
              
              {project.features.map((label) => (
                  <Chip 
                      key={label}
                      label={formatLabel(label)}
                      size="small"
                      variant="outlined"
                  />
              ))}
                  /*/
            }
          </Box>

          <Typography variant="body2" className="project-description">
            {project.description}
          </Typography>

        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ProjectCard;