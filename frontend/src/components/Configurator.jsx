import { useFeatureTrees } from "../hooks/useFeatureTrees";
import FeatureNode from "./FeatureNode";
import "./Configurator.css";
import { useState } from "react";
import useApi from "../hooks/useApi";
import SWOTModal from "./SWOTModal";
export default function Configurator() {
  const {data:uvlModel}=useApi({endpoint:"/model",initialData:{}})
  const { isActive,handleToggle,trees,getProperty,setProperty} = useFeatureTrees();
  const {data:recommendations,refetch}=useApi({endpoint:"/recommend",method:"POST",initialData:[]})
  const {data:languages}=useApi({endpoint:"/languages",initialData:[]})
  const {data:dafo,refetch:fetchDafo,isLoading,setData:setDafo}=useApi({endpoint:"/swot",method:"POST",initialData:null})
  const [comments,setComments]=useState("")
  const [isSwotModalOpen, setSwotModalOpen] = useState(false);

  const incompatibleTypes = [
    ["Full Stack", "Frontend"], 
    ["Full Stack", "Backend"]
  ];
  function getNode(feature){
    return uvlModel?.children?.find(f => f.name === feature)
  }
  function handleRadioChange(index,type) {
    if (!isActive(index,getNode(type))) {
      incompatibleTypes
        .filter(conj => conj.includes(type))
        .forEach(conj => 
          conj.filter((f) => isActive(trees.findIndex(t=>t.type===f),getNode(f))).forEach(f => handleToggle(trees.findIndex(t=>t.type===f),getNode(f)))
        );
      handleToggle(index,getNode(type));
    } else {
      // Si ya estaba activo y permiten deseleccionarlo
      handleToggle(index,getNode(type));
    }
  }
  function handleSubmit() {
    const body=trees.filter((t,index)=>isActive(index,getNode(t.type)))
    refetch({overrideBody:body})
  }
  async function getDafo(recommendation){
    setDafo(null)
    const body={recommendation,preferences:trees.filter((t,index)=>isActive(index,getNode(t.type))),comments}
    fetchDafo({overrideBody:body})
    setSwotModalOpen(true);
  }
  const groupedRecommendations = recommendations.reduce((acc, project) => {
    const type = project.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(project);
    return acc;
  }, {});
  console.log(groupedRecommendations)

  return (
    <div className="uvl-configurator configurator-page">
      <h2 className="configurator-main-title">Tipo de Proyecto</h2>
      
      {/* Reutilizamos feature-group para que tenga el layout elástico/wrap */}
      <div className="feature-group">
        {trees.map((tree,index) => {
          const type=tree.type
          const node=getNode(type)
          const active = node!=null && isActive(index,node);

          return (
            <div key={type} className={`feature-card ${active ? 'active' : ''}`}>
              <label className="feature-header root-header">
                <input
                  type="checkbox"
                  id={type}
                  checked={active} // Corregido el bug de React
                  onChange={() => handleRadioChange(index,type)}
                />
                <span className="custom-control custom-checkbox"></span>
                <span className="feature-name">{type}</span>
              </label>
              {active && node && (
                <div className="feature-children root-children">
                  <div className="language-dropdown-container">
          <select 
            className="language-select"
            value={getProperty(index,"language")}
            onChange={(e)=>setProperty(index,"language",e.target.value)}
          >
            <option value="" >Selecciona un lenguaje...</option>
            {languages.map(l=>(
                <option value={l.name}>{l.name}</option>
            ))}
            
          </select>
            </div>
                  <FeatureNode
                    node={node}
                    depth={1}
                    index={index}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="comments-container">
        <label className="label-comments">Comentarios adicionales:</label>
        <input type="text" onChange={(e)=>setComments(e.target.value)} value={comments} className="input-text"/>
      </div>
      <button className="submit-button" onClick={handleSubmit}>Obtener recomendación</button>
      {Object.entries(groupedRecommendations).map(([type,recommendations])=>(
        <div className="type-container">
            <h2>{type}</h2>
            {recommendations.map(recommendation=>(
              <div className="project-container">
                <h2>{recommendation.project}</h2>
                <div className="libraries-container">
                  {recommendation.libraries.map(l=>(
                    <span>
                      {l}
                    </span>
                  ))}
                </div>
                <button className="swot-button" onClick={()=>getDafo(recommendation)}>Obtener DAFO</button>
              </div>
            ))}
        </div>
      ))}
      {isSwotModalOpen && (
                <SWOTModal 
                    swot={dafo} 
                    onClose={() => setSwotModalOpen(false)} 
                    isLoading={isLoading}
                />
            )}
    </div>
  );
}