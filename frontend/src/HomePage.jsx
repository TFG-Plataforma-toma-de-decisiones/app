import ProjectCard from './components/ProjectCard'; // Ajusta la ruta
import useAxios from './hooks/useAxios'
import useUVLModel from './hooks/useUVLModel';
function Home() {
  // Datos de prueba imitando la captura
  const{data}=useAxios("/projects",[])
  const {uvlModel}=useUVLModel()
  console.log(uvlModel)

  return (
    <div>
      <h1 className="hero-title">Open Source <span className="highlight">Stack Explorer</span></h1>
      <p className="hero-subtitle">Browse, compare, and find the perfect frameworks for your project.</p>
      <div className="projects-grid">
        {data.map(proj => (
          <ProjectCard key={proj.id} project={proj} />
        ))}
      </div>
    </div>
  );
}

export default Home;