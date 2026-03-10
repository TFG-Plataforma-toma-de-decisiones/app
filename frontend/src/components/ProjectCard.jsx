import "./ProjectCard.css"
import { useNavigate } from "react-router-dom";
function ProjectCard({project}){
    const navigate=useNavigate()
    return(
        <div className="project-card" onClick={()=>navigate(`/project/${project.id}`)}>
            <p className="project-name">{project.name}</p>
            <div className="label-container">
                <span className={`badge badge-${project.language}`}>{project.language}</span>
                <span className={`badge badge-${project.type}`}>{project.type}</span>
            </div>
            <p className="project-description">{project.description}</p>
        </div>
    )
}
export default ProjectCard;