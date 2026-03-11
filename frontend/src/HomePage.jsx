import React from 'react';
import { Typography, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import ProjectCard from './components/ProjectCard';
import useAxios from './hooks/useAxios';


const HomeWrapper = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),    // ~32px
  paddingBottom: theme.spacing(4), // ~32px
}));


const HomeHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(6),  
}));


const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));


const HeroHighlight = styled('span')(({ theme }) => ({
  color: theme.palette.primary.main, 
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary, 
  marginTop: theme.spacing(1),
}));


// ==========================================
// 2. EL COMPONENTE PRINCIPAL
// ==========================================

function Home() {
  const { data: projects } = useAxios("/projects", []);

  return (
    <HomeWrapper>
      
      {/* Cabecera de la página */}
      <HomeHeader>
        <HeroTitle variant="h2" component="h1">
          Open Source{' '}
          <HeroHighlight>
            Stack Explorer
          </HeroHighlight>
        </HeroTitle>
        
        <HeroSubtitle variant="h6" component="p">
          Browse, compare, and find the perfect frameworks for your project.
        </HeroSubtitle>
      </HomeHeader>

      {/* Grid de Proyectos */}
      {/* Nota: Asumo que usas MUI v6 por tu propiedad `size`. ¡Está perfecto! */}
      <Grid container spacing={3}>
        {projects.map((proj) => (
          <Grid key={proj.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <ProjectCard project={proj} />
          </Grid>
        ))}
      </Grid>
      
    </HomeWrapper>
  );
}

export default Home;