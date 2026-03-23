import React, { useState } from 'react';
import './UVLTreeEditor.css';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import useApi from "../../hooks/useApi"
import useAction from '../../hooks/useAction';


const EditableNode = ({ node,onUpdate,depth}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePropertyChange=(property,e)=>{
    onUpdate({...node,[property]:e.target.value})
  }

  const handleAddChild = () => {
    const newChild = {
      name: "Nueva Característica",
      relationship: "OPTIONAL",
      children: []
    };
    const updatedChildren = [...(node.children || []), newChild];
    onUpdate({...node,children:updatedChildren});
    setIsExpanded(true); 
  };

  const handleDeleteChild = () => {
    onUpdate(null)
  };

  
  const disabled=depth<=1
  if (!node) return null;

  return (
    <div className="editable-node">
      <div className="node-header">
        
        {node.children && node.children.length > 0 ? (
          <button className="icon-btn" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        ) : (
          <span className="spacer"></span>
        )}

        <input 
          type="text" 
          className="node-name-input" 
          value={node.name } 
          onChange={(e)=>handlePropertyChange('name',e)}
          disabled={disabled} 
          placeholder="Nombre de la característica"
        />

        {!disabled && (
          <select 
            className="node-type-select" 
            value={node.relationship} 
            onChange={(e)=>handlePropertyChange('relationship',e)}
          >
            <option value="MANDATORY">MANDATORY</option>
            <option value="OPTIONAL">OPTIONAL</option>
            <option value="OR">OR</option>
            <option value="ALTERNATIVE">ALTERNATIVE</option>
          </select>
        )}

        <div className="node-actions">
           {depth>0 &&
          <button className="icon-btn add-btn" onClick={handleAddChild} title="Añadir hijo">
            <FaPlus />
          </button>
          }
          {!disabled && (
            <button className="icon-btn delete-btn" onClick={handleDeleteChild} title="Borrar nodo">
              <FaTrash />
            </button>
          )}
        </div>
      </div>

      {isExpanded && node.children && node.children.length > 0 && (
        <div className="node-children">
          {node.children.map((child, index) => (
            <EditableNode
              node={child}
              onUpdate={childNode=>{
                const copyChildren=[...node.children]
                if (childNode){
                  copyChildren[index]=childNode
                }
                else{
                  copyChildren.splice(index,1) 
                }
                onUpdate({...node,children:copyChildren})
              }} 
              depth={depth+1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default function UVLTreeEditor() {
  const { data: model, setData: setModel } = useApi({ endpoint: "/manage-uvl", initialData: {} });
  const { run, isLoading: isSaving } = useAction();
  const handleSave = async () => {
    await run({
      endpoint: '/manage-uvl',
      method: "PUT",
      body: model
    });
  };
  return (
    <div className="uvl-tree-editor">
      <h2>Editor de Estructura UVL</h2>
      <div className="editor-container">
        <EditableNode 
          node={model} 
          onUpdate={setModel} 
           depth={0}
        />
      </div>
      <button 
        className="submit-button" 
        onClick={handleSave}
        disabled={isSaving}
        style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
      >
        {isSaving ? 'Guardando...' : 'Guardar Modelo'}
      </button>
    </div>
  );
}