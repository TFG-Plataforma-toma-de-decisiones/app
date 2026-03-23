import { useState } from 'react';
import './UVLTreeEditor.css';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import useApi from "../../hooks/useApi";
import apiClient from '../../services/api';
import { useFeedback } from '../../hooks/useFeedback';
import { useNavigate } from 'react-router-dom';
const RELATION_TYPES = ["MANDATORY", "OPTIONAL", "OR", "ALTERNATIVE"];
const MERGEABLE_RELATION_TYPES = new Set(["MANDATORY", "OPTIONAL"]);
const RELATION_ORDER = {
  MANDATORY: 0,
  ALTERNATIVE: 1,
  OR: 2,
  OPTIONAL: 3
};

function createNode() {
  return {
    name: "Nueva Caracteristica",
    relations: []
  };
}

function createRelation(type = "OPTIONAL") {
  return {
    type,
    children: [createNode()]
  };
}

function buildDisplayRelations(relations = []) {
  const sortedRelations = relations
    .map((relation, index) => ({
      ...relation,
      children: [...(relation.children ?? [])],
      sourceIndices: [index]
    }))
    .sort((firstRelation, secondRelation) => {
      const firstOrder = RELATION_ORDER[firstRelation.type] ?? Number.MAX_SAFE_INTEGER;
      const secondOrder = RELATION_ORDER[secondRelation.type] ?? Number.MAX_SAFE_INTEGER;
      return firstOrder - secondOrder;
    });

  return sortedRelations.reduce((groupedRelations, relation) => {
    if (!MERGEABLE_RELATION_TYPES.has(relation.type)) {
      groupedRelations.push(relation);
      return groupedRelations;
    }

    const existingRelation = groupedRelations.find(
      (groupedRelation) => groupedRelation.type === relation.type
    );

    if (!existingRelation) {
      groupedRelations.push(relation);
      return groupedRelations;
    }

    existingRelation.children = existingRelation.children.concat(relation.children);
    existingRelation.sourceIndices = existingRelation.sourceIndices.concat(relation.sourceIndices);
    return groupedRelations;
  }, []);
}

function normalizeRelations(relations = []) {
  return buildDisplayRelations(relations).map(({ sourceIndices, ...relation }) => relation);
}

function EditableRelation({ relation, depth, onUpdate, onDelete, path }) {
  const children = relation.children ?? [];

  const handleTypeChange = (event) => {
    onUpdate({ ...relation, type: event.target.value });
  };

  const handleAddChild = () => {
    onUpdate({
      ...relation,
      children: children.concat(createNode())
    });
  };

  const handleChildUpdate = (index, childNode) => {
    const nextChildren = [...children];
    if (childNode) {
      nextChildren[index] = childNode;
    } else {
      nextChildren.splice(index, 1);
    }

    onUpdate({
      ...relation,
      children: nextChildren
    });
  };

  return (
    <div className="relation-group">
      <div className="relation-header">
        <span className="relation-badge">Relacion</span>
        <select
          className="node-type-select"
          value={relation.type}
          onChange={handleTypeChange}
        >
          {RELATION_TYPES.map((relationType) => (
            <option key={relationType} value={relationType}>
              {relationType}
            </option>
          ))}
        </select>

        <div className="node-actions relation-actions">
          <button className="icon-btn add-btn" onClick={handleAddChild} title="Anadir hijo">
            <FaPlus />
          </button>
          <button className="icon-btn delete-btn" onClick={onDelete} title="Borrar relacion">
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="node-children relation-children">
        {children.map((child, index) => (
          <EditableNode
            key={`${path}-child-${index}`}
            path={`${path}-child-${index}`}
            node={child}
            depth={depth + 1}
            onUpdate={(childNode) => handleChildUpdate(index, childNode)}
          />
        ))}
      </div>
    </div>
  );
}

const EditableNode = ({ node, onUpdate, depth, path = "root" }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  if (!node) {
    return null;
  }

  const relations = node.relations ?? [];
  const displayRelations = buildDisplayRelations(relations);
  const hasRelations = displayRelations.length > 0;
  const isProtectedNode = depth <= 1;

  const handleNameChange = (event) => {
    onUpdate({ ...node, name: event.target.value });
  };

  const handleAddRelation = () => {
    onUpdate({
      ...node,
      relations: normalizeRelations(relations.concat(createRelation()))
    });
    setIsExpanded(true);
  };

  const handleDeleteNode = () => {
    onUpdate(null);
  };

  const handleRelationUpdate = (relationToUpdate, nextRelation) => {
    const sourceIndices = relationToUpdate.sourceIndices ?? [];
    const sourceIndexSet = new Set(sourceIndices);
    const remainingRelations = relations.filter((_, index) => !sourceIndexSet.has(index));

    if (nextRelation) {
      const insertIndex = sourceIndices.length ? Math.min(...sourceIndices) : remainingRelations.length;
      remainingRelations.splice(insertIndex, 0, nextRelation);
    }

    onUpdate({
      ...node,
      relations: normalizeRelations(remainingRelations)
    });
  };

  return (
    <div className="editable-node">
      <div className="node-header">
        {hasRelations ? (
          <button className="icon-btn" onClick={() => setIsExpanded(!isExpanded)} title="Expandir o contraer">
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        ) : (
          <span className="spacer"></span>
        )}

        <input
          type="text"
          className="node-name-input"
          value={node.name ?? ""}
          onChange={handleNameChange}
          disabled={isProtectedNode}
          placeholder="Nombre de la caracteristica"
        />

        <div className="node-actions">
          {depth > 0 && (
            <button className="icon-btn add-btn" onClick={handleAddRelation} title="Anadir relacion">
              <FaPlus />
            </button>
          )}
          {!isProtectedNode && (
            <button className="icon-btn delete-btn" onClick={handleDeleteNode} title="Borrar nodo">
              <FaTrash />
            </button>
          )}
        </div>
      </div>

      {isExpanded && hasRelations && (
        <div className="node-children">
          {displayRelations.map((relation, index) => (
            <EditableRelation
              key={`${path}-relation-${relation.sourceIndices?.join('-') ?? index}`}
              path={`${path}-relation-${relation.sourceIndices?.join('-') ?? index}`}
              relation={relation}
              depth={depth}
              onUpdate={(nextRelation) => handleRelationUpdate(relation, nextRelation)}
              onDelete={() => handleRelationUpdate(relation, null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function UVLTreeEditor() {
  const { data: model, setData: setModel } = useApi({ endpoint: "/manage-uvl", initialData: {} });
  const {showMessage} =useFeedback()
  const navigate=useNavigate()
  const handleSave = async () => {
    try{
      await apiClient.put("/manage-uvl",model)
      navigate('/')
    }
    catch(error){
      if(error?.response?.status===409){
        navigate('/conflicts-projects')
      }
      else{
        showMessage({
          message: error.response?.data?.detail || "Error en la petición",
          type: "error",
          title: "Ocurrió un error"
        });
      } 
    }
  };

  return (
    <div className="uvl-tree-editor">
      <h2>Editor de Estructura UVL</h2>
      <div className="editor-container">
        <EditableNode
          node={model}
          onUpdate={setModel}
          depth={0}
          path="root"
        />
      </div>
      <button
        className="submit-button"
        onClick={handleSave}
      >
        {'Guardar Modelo'}
      </button>
    </div>
  );
}
