import { useFeatureTrees } from "../../hooks/useFeatureTrees";
import FeatureNode from "../shared/FeatureNode";
import "./Configurator.css";
import { useState } from "react";
import useApi from "../../hooks/useApi";
import SWOTModal from "../modals/SWOTModal";
import { findRootFeatureNode } from "../../utils/featureModel";
import usePollingAction from "../../hooks/usePollingAction"
export default function Configurator() {
  const {data:uvlModel}=useApi({endpoint:"/model",initialData:{}})
  const { isActive,handleToggle,trees,getProperty,setProperty} = useFeatureTrees();
  const {data:recommendations,refetch}=useApi({endpoint:"/recommend",method:"POST",initialData:[]})
  const {data:languages}=useApi({endpoint:"/languages",initialData:[]})
  const [dafo,setDafo]=useState()
  const {runPolling}=usePollingAction()
  const [comments,setComments]=useState("")
  const [isSwotModalOpen, setSwotModalOpen] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState({});

  const incompatibleTypes = [
    ["Full Stack", "Frontend"], 
    ["Full Stack", "Backend"]
  ];
  function getNode(feature){
    return findRootFeatureNode(uvlModel, feature)
  }
  function handleSelectReccomendation(recommendation){
    setSelectedRecommendations(prev => ({
      ...prev,
      [recommendation.type]: recommendation
    }));
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
  async function handleSubmit() {
    const body=trees.filter((t,index)=>isActive(index,getNode(t.type)))
    await refetch({overrideBody:body})
    setSelectedRecommendations({})
  }
  async function getDafo(){
    setDafo(null)
    const body={recommendations:Object.values(selectedRecommendations),preferences:trees.filter((t,index)=>isActive(index,getNode(t.type))),comments}
    await runPolling({body,endpoint:"/swot",statusEndpointBase:"/swot-status",updateState:resp=>setDafo(resp.swot)})
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
              <div className={`project-container ${selectedRecommendations[type]===recommendation ? 'selected' : ''}`} onClick={()=>handleSelectReccomendation(recommendation)}>
                <h2>{recommendation.project}</h2>
                <div className="libraries-container">
                  {recommendation.libraries.map(l=>(
                    <span>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            

        </div>
        
        
      ))}
      
      {recommendations.length > 0 && 
      <div className="dafo-action-container" style={{ marginTop: '20px', textAlign: 'center' }}>
      <button 
            className="swot-button" 
            onClick={getDafo}
            disabled={Object.keys(selectedRecommendations).length === 0}
          >
            Obtener DAFO de la selección
          </button>
      </div>
      }
      {isSwotModalOpen && (
                <SWOTModal 
                    swot={dafo} 
                    onClose={() => setSwotModalOpen(false)} 
                />
            )}
    </div>
  );
}
