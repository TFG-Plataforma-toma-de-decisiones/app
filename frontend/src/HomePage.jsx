import ProjectCard from './components/ProjectCard';
import useAxios from './hooks/useAxios';
import useUVLModel from './hooks/useUVLModel';
import { Container, Typography, Grid, Box } from '@mui/material';
import './App.css'; // Aseguramos que los estilos globales se carguen

function Home() {
  const { data: projects } = useAxios("/projects", []);
  const { uvlModel } = useUVLModel();
  console.log(uvlModel);

  return (
    <Container maxWidth="lg" className="home-container">
      <Box className="home-header">
        <Typography variant="h2" component="h1" className="hero-title">
          Open Source{' '}
          <Typography variant="h2" component="span" className="hero-highlight">
            Stack Explorer
          </Typography>
        </Typography>
        <Typography variant="h6" className="hero-subtitle">
          Browse, compare, and find the perfect frameworks for your project.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {projects.map(proj => (
          <Grid item key={proj.id} xs={12} sm={6} md={4}>
            <ProjectCard project={proj} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;