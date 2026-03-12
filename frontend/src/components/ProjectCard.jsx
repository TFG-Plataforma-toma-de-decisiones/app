import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
const getChipColor = (category) => {
  if (!category) return 'default';
  const cat = category.toLowerCase();
  if (cat.includes('backend')) return 'primary';
  if (cat.includes('frontend')) return 'secondary';
  if (cat.includes('full')) return 'warning';
  if (cat.includes('library')) return 'info';
  return 'default';
};

const formatLabel = (label) => {
  if (!label) return '';
  return label
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});
const StyledActionArea = styled(CardActionArea)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
});
const TagsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1), 
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
}));

const ProjectTitle = styled(Typography)({
  fontWeight: 700,
});

const ProjectDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}));


// ==========================================
// 3. EL COMPONENTE PRINCIPAL
// ==========================================

function ProjectCard({ project }) {
  const navigate =useNavigate()
  return (
    <StyledCard variant="outlined">
      {/* Al tener el hover y ripple effect en el ActionArea, toda la tarjeta es clicable */}
      <StyledActionArea onClick={()=>navigate(`/projects/${project.id}`)}>
        <CardContent>
          
          <ProjectTitle variant="h6" component="h2">
            {project.name}
          </ProjectTitle>
          
          <TagsContainer>
            {/* Chip principal (Tipo de proyecto) */}
            <Chip 
              label={formatLabel(project.type)} 
              color={getChipColor(project.type)}
              size="small"
            />
            
            {/* Chips adicionales (Features). He limpiado el código comentado */}
            {project.features && project.features.map((label) => (
              <Chip 
                key={label}
                label={formatLabel(label)}
                size="small"
                variant="outlined"
              />
            ))}
          </TagsContainer>

          <ProjectDescription variant="body2">
            {project.description}
          </ProjectDescription>

        </CardContent>
      </StyledActionArea>
    </StyledCard>
  );
}

export default ProjectCard;