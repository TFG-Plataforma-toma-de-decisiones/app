import { useState } from 'react';
import './UVLTreeEditor.css';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import useApi from "../../hooks/useApi";
import apiClient from '../../services/api';
import { useFeedback } from '../../hooks/useFeedback';
import { useNavigate } from 'react-router-dom';

const RELATION_TYPES = ["MANDATORY", "OPTIONAL", "OR", "ALTERNATIVE"];

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

function EditableRelation({ relation, depth, onUpdate, onDelete, path }) {
  const handleTypeChange = (event) => {
    onUpdate({ ...relation, type: event.target.value });
  };

  const handleAddChild = () => {
    onUpdate({
      ...relation,
      children: [...relation.children, createNode()]
    });
  };

  const handleChildUpdate = (index, childNode) => {
    const nextChildren = [...relation.children];
    if (childNode) {
      nextChildren[index] = childNode;
    } else {
      nextChildren.splice(index, 1);
    }

    if (nextChildren.length === 0) {
      onDelete();
      return;
    }

    onUpdate({
      ...relation,
      children: nextChildren
    });
  };

  return (
    <div className="relation-group" data-cy={`relation-${path}`}>
      <div className="relation-header">
        <span className="relation-badge">Relacion</span>
        <select
          className="node-type-select"
          data-cy={`relation-type-${path}`}
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
          <button className="icon-btn add-btn" onClick={handleAddChild} title="Anadir hijo" data-cy={`add-feature-${path}`}>
            <FaPlus />
          </button>
          <button className="icon-btn delete-btn" onClick={onDelete} title="Borrar relacion">
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="node-children relation-children">
        {relation.children.map((child, index) => (
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
  const hasRelations = node.relations.length > 0;
  const isProtectedNode = depth <= 1;
  const [activeAttrKey, setActiveAttrKey] = useState('');
  const attributes = node.attributes || {};

  const handleNameChange = (event) => {
    onUpdate({ ...node, name: event.target.value });
  };

  const handleAddRelation = () => {
    onUpdate({
      ...node,
      relations: [...node.relations, createRelation()]
    });
    setIsExpanded(true);
  };

  const handleDeleteNode = () => {
    onUpdate(null);
  };

  const handleRelationUpdate = (relationIndex, nextRelation) => {
    const nextRelations = [...node.relations];
    if (nextRelation) {
      nextRelations[relationIndex] = nextRelation;
    } else {
      nextRelations.splice(relationIndex, 1);
    }

    onUpdate({
      ...node,
      relations: nextRelations
    });
  };

  const handleActiveAttrValueChange = (newValue) => {
    if (!activeAttrKey) return;

    onUpdate({
      ...node,
      attributes: { ...attributes, [activeAttrKey]: newValue }
    });
  };

  const handleDeleteActiveAttribute = () => {
    const newAttributes = { ...attributes };
    delete newAttributes[activeAttrKey];
    onUpdate({ ...node, attributes: newAttributes });
    const remainingKeys = Object.keys(newAttributes);
    setActiveAttrKey(remainingKeys.length > 0 ? remainingKeys[0] : '');
  };

  return (
    <div className="editable-node" data-cy={`feature-node-${path}`}>
      <div className="node-header" data-cy={`feature-node-header-${path}`}>
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
          data-cy={`feature-name-${path}`}
          value={node.name ?? ""}
          onChange={handleNameChange}
          disabled={isProtectedNode}
          placeholder="Nombre de la caracteristica"
        />

        <div className="node-attributes single-row">
          <datalist id={`datalist-attrs-${path}`}>
            {Object.keys(attributes).map((key) => (
              <option key={key} value={key} />
            ))}
          </datalist>
          <div className="attribute-row">
            <span className="attribute-badge">Atributos</span>
            <input
              type="text"
              className="attribute-input key-input"
              list={`datalist-attrs-${path}`}
              value={activeAttrKey}
              onChange={(event) => setActiveAttrKey(event.target.value)}
              placeholder="Selecciona o crea..."
              title="Clave del atributo"
            />
            <span className="attribute-separator">:</span>
            <input
              type="text"
              className="attribute-input value-input"
              value={activeAttrKey ? (attributes[activeAttrKey] ?? "") : ""}
              onChange={(event) => handleActiveAttrValueChange(event.target.value)}
              placeholder="Valor del atributo"
              disabled={!activeAttrKey}
            />
            <button
              className="icon-btn delete-btn"
              onClick={handleDeleteActiveAttribute}
              title="Borrar atributo actual"
              disabled={!activeAttrKey || attributes[activeAttrKey] === undefined}
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>

        <div className="node-actions">
          {depth > 0 && (
            <button className="icon-btn add-btn" onClick={handleAddRelation} title="Anadir relacion" data-cy={`add-relation-${path}`}>
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
          {node.relations.map((relation, index) => (
            <EditableRelation
              key={`${path}-relation-${index}`}
              path={`${path}-relation-${index}`}
              relation={relation}
              depth={depth}
              onUpdate={(nextRelation) => handleRelationUpdate(index, nextRelation)}
              onDelete={() => handleRelationUpdate(index, null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function UVLTreeEditor() {
  const { data: model, setData: setModel } = useApi({ endpoint: "/manage-uvl", initialData: createNode() });
  const { showMessage } = useFeedback();
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      await apiClient.put("/manage-uvl", model);
      navigate('/');
    } catch (error) {
      if (error?.response?.status === 409) {
        navigate('/conflicts-projects');
      } else {
        showMessage({
          message: error.response?.data?.detail || "Error en la peticion",
          type: "error",
          title: "Ocurrio un error"
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
        data-cy="save-uvl-model"
        onClick={handleSave}
      >
        {'Guardar Modelo'}
      </button>
    </div>
  );
}
