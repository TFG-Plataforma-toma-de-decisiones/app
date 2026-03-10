import ProjectCard from './components/ProjectCard'; // Ajusta la ruta

function Home() {
  // Datos de prueba imitando la captura
  const mockProjects = [
    { id: 1, name: "Express.js", type: "Backend", language: "JavaScript", description: "Fast, unopinionated, minimalist web framework for Node.js." },
    { id: 2, name: "Django", type: "Backend", language: "Python", description: "High-level Python web framework that encourages rapid development." },
    { id: 3, name: "React", type: "Frontend", language: "TypeScript", description: "A JavaScript library for building user interfaces." },
    { id: 4, name: "Next.js", type: "Full Stack", language: "TypeScript", description: "The React framework for production." }
  ];

  return (
    <div>
      <h1 className="hero-title">Open Source <span className="highlight">Stack Explorer</span></h1>
      <p className="hero-subtitle">Browse, compare, and find the perfect frameworks for your project.</p>
      <div className="projects-grid">
        {mockProjects.map(proj => (
          <ProjectCard key={proj.id} project={proj} />
        ))}
      </div>
    </div>
  );
}

export default Home;