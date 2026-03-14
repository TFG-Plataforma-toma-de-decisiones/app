import { useFeatureTrees } from "../hooks/useFeatureTrees";
import FeatureNode from "./FeatureNode";
import "./Configurator.css"; // (Opcional) Por si quieres separar estilos globales
import { useState } from "react";
import useApi from "../hooks/useApi";
export default function Configurator() {
  const {data:uvlModel}=useApi({endpoint:"/model",initialData:{}})
  const { isActive,handleToggle,trees,getProperty,setProperty} = useFeatureTrees();
  console.log(trees)
  const [comments,setComments]=useState()
  const incompatibleTypes = [
    ["FullStack", "Frontend"], 
    ["FullStack", "Backend"]
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

  return (
    <div className="uvl-configurator configurator-page">
      <h2 className="configurator-main-title">Tipo de Proyecto</h2>
      
      {/* Reutilizamos feature-group para que tenga el layout elástico/wrap */}
      <div className="feature-group">
        {trees.map((tree,index) => {
          const type=tree.type
          const node=getNode(type)
          const active = node!=null && isActive(index,node);
          const displayName = type === "FullStack" ? "Full-Stack" : type.charAt(0).toUpperCase() + type.slice(1);

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
                <span className="feature-name">{displayName}</span>
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
            <option value="javascript">JavaScript / TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C# / .NET</option>
            <option value="php">PHP</option>
          </select>
            </div>
                  <FeatureNode
                    node={node}
                    depth={1}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="comments-container">
        <label className="label-comments">Comentarios adicionales:</label>
        <input type="text" onChange={(e)=>setComments(e.target.value)} value={comments}/>
      </div>
      <button className="submit-button">Obtener recomendación</button>
    </div>
  );
}