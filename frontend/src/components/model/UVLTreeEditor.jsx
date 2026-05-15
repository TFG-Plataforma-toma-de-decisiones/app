import { useState } from 'react';
import './UVLTreeEditor.css';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight, FaGripVertical, FaCopy } from 'react-icons/fa';
import useApi from "../../hooks/useApi";
import apiClient from '../../services/api';
import { useFeedback } from '../../hooks/useFeedback';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core';

const RELATION_TYPES = ["MANDATORY", "OPTIONAL", "OR", "ALTERNATIVE"];

function createNode() {
  return {
    name: "Nueva Caracteristica",
    relations: [],
    attributes: {}
  };
}

function createRelation(type = "OPTIONAL") {
  return {
    type,
    children: [createNode()]
  };
}

function incrementSuffix(name) {
  const match = name.match(/^(.*)-(\d+)$/);
  if (match) {
    return `${match[1]}-${parseInt(match[2], 10) + 1}`;
  }
  return `${name}-2`;
}

function deepCopyWithIncrementedSuffix(node) {
  return {
    ...node,
    name: incrementSuffix(node.name),
    relations: node.relations.map(rel => ({
      ...rel,
      children: rel.children.map(child => deepCopyWithIncrementedSuffix(child))
    }))
  };
}

function EditableRelation({ relation, depth, onUpdate, onDelete, path }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${path}`,
    data: {
      insertarNodoAqui: (nuevoNodo) => {
        onUpdate(prevRelation => ({
          ...prevRelation,
          children: [...prevRelation.children, nuevoNodo]
        }));
      }
    }
  });

  const handleTypeChange = (event) => {
    onUpdate(prev => ({ ...prev, type: event.target.value }));
  };

  const handleAddChild = () => {
    onUpdate(prev => ({
      ...prev,
      children: [...prev.children, createNode()]
    }));
  };

  const handleCopyChild = (index) => {
    onUpdate(prevRelation => {
      const nextChildren = [...prevRelation.children];
      const copy = deepCopyWithIncrementedSuffix(nextChildren[index]);
      nextChildren.splice(index + 1, 0, copy);
      return { ...prevRelation, children: nextChildren };
    });
  };

  const handleChildUpdate = (index, childUpdater) => {
    onUpdate(prevRelation => {
      const nextChildren = [...prevRelation.children];
      const currentChild = nextChildren[index];

      const nextChild = typeof childUpdater === 'function'
        ? childUpdater(currentChild)
        : childUpdater;

      if (nextChild) {
        nextChildren[index] = nextChild;
      } else {
        nextChildren.splice(index, 1);
      }

      if (nextChildren.length === 0) {
        return null;
      }

      return { ...prevRelation, children: nextChildren };
    });
  };

  return (
    <div 
      className="relation-group" 
      data-cy={`relation-${path}`}
      ref={setNodeRef}
      style={{
        backgroundColor: isOver ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
        border: isOver ? '2px dashed #4CAF50' : 'none',
        transition: 'all 0.2s ease'
      }}
    >
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
            onUpdate={(updater) => handleChildUpdate(index, updater)}
            onCopy={() => handleCopyChild(index)}
          />
        ))}
      </div>
    </div>
  );
}

const EditableNode = ({ node, onUpdate, onCopy, depth, path = "root" }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 1);
  const hasRelations = node.relations.length > 0;
  const isProtectedNode = depth <= 1;
  const [activeAttrKey, setActiveAttrKey] = useState('');
  const [newAttrKey, setNewAttrKey] = useState('');
  const attributes = node.attributes || {};
  const attributeDataCySuffix = `${node.name || 'empty'}`;
  const isAddingNew = activeAttrKey === '__new__';

  const { attributes: dragAttrs, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `draggable-${path}`,
    disabled: isProtectedNode,
    data: {
      node: node,
      eliminarEsteNodo: () => onUpdate(() => null)
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: isDragging ? 'relative' : 'static',
  } : undefined;

  const handleNameChange = (event) => {
    onUpdate(prev => ({ ...prev, name: event.target.value }));
  };

  const handleAddRelation = () => {
    onUpdate(prev => ({
      ...prev,
      relations: [...prev.relations, createRelation()]
    }));
    setIsExpanded(true);
  };

  const handleDeleteNode = () => {
    onUpdate(() => null);
  };

  const handleRelationUpdate = (relationIndex, relationUpdater) => {
    onUpdate(prevNode => {
      const nextRelations = [...prevNode.relations];
      const currentRelation = nextRelations[relationIndex];

      const nextRelation = typeof relationUpdater === 'function'
        ? relationUpdater(currentRelation)
        : relationUpdater;

      if (nextRelation) {
        nextRelations[relationIndex] = nextRelation;
      } else {
        nextRelations.splice(relationIndex, 1);
      }

      return { ...prevNode, relations: nextRelations };
    });
  };

  const handleActiveAttrValueChange = (newValue) => {
    if (!activeAttrKey || isAddingNew) return;

    onUpdate(prev => ({
      ...prev,
      attributes: { ...(prev.attributes || {}), [activeAttrKey]: newValue }
    }));
  };

  const handleDeleteActiveAttribute = () => {
    onUpdate(prev => {
      const newAttributes = { ...(prev.attributes || {}) };
      delete newAttributes[activeAttrKey];
      
      const remainingKeys = Object.keys(newAttributes);
      setActiveAttrKey(remainingKeys.length > 0 ? remainingKeys[0] : '');
      
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleSelectKey = (event) => {
    setActiveAttrKey(event.target.value);
    if (event.target.value !== '__new__') setNewAttrKey('');
  };

  const handleConfirmNewAttr = () => {
    const key = newAttrKey.trim();
    if (!key) return;

    onUpdate(prev => ({
      ...prev,
      attributes: { ...(prev.attributes || {}), [key]: '' }
    }));
    
    setActiveAttrKey(key);
    setNewAttrKey('');
  };

  return (
    <div className="editable-node" data-cy={`feature-node-${path}`} ref={setNodeRef} style={style}>
      <div className="node-header" data-cy={`feature-node-header-${path}`}>
        
        {!isProtectedNode && (
          <div className="drag-handle" {...listeners} {...dragAttrs} style={{ cursor: 'grab', marginRight: '8px', color: '#888' }}>
            <FaGripVertical />
          </div>
        )}

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
          <div className="attribute-row">
            <span className="attribute-badge">Atributos</span>
            {isAddingNew ? (
              <input
                type="text"
                className="attribute-input key-input"
                value={newAttrKey}
                onChange={(e) => setNewAttrKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmNewAttr()}
                onBlur={() => newAttrKey.trim() ? handleConfirmNewAttr() : setActiveAttrKey('')}
                placeholder="Nueva clave..."
                autoFocus
              />
            ) : (
              <select
                className="attribute-input key-input"
                data-cy={`attribute-selector`}
                value={activeAttrKey}
                onChange={handleSelectKey}
              >
                <option value="">Selecciona o crea...</option>
                {Object.keys(attributes).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
                <option value="__new__">+ Nueva clave</option>
              </select>
            )}
            <span className="attribute-separator">:</span>
            <input
              type="text"
              className="attribute-input value-input"
              data-cy={`attribute-input-${attributeDataCySuffix}`}
              value={activeAttrKey && !isAddingNew ? (attributes[activeAttrKey] ?? "") : ""}
              onChange={(event) => handleActiveAttrValueChange(event.target.value)}
              placeholder="Valor del atributo"
              disabled={!activeAttrKey || isAddingNew}
            />
            <button
              className="icon-btn delete-btn"
              data-cy={`delete-attribute-${attributeDataCySuffix}`}
              onClick={handleDeleteActiveAttribute}
              title="Borrar atributo actual"
              disabled={!activeAttrKey || isAddingNew || attributes[activeAttrKey] === undefined}
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
          {onCopy && !isProtectedNode && (
            <button className="icon-btn copy-btn" onClick={onCopy} title="Copiar nodo">
              <FaCopy />
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
              onUpdate={(updater) => handleRelationUpdate(index, updater)}
              onDelete={() => handleRelationUpdate(index, () => null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function UVLTreeEditor() {
  const { data: model, setData: setModel, isLoading } = useApi({ endpoint: "/manage-uvl", initialData: createNode() });
  const { showMessage } = useFeedback();
  const navigate = useNavigate();

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const nodoArrastrado = active.data.current?.node;
    const eliminarNodoOrigen = active.data.current?.eliminarEsteNodo;
    const insertarEnDestino = over.data.current?.insertarNodoAqui;

    if (eliminarNodoOrigen && insertarEnDestino && nodoArrastrado) {
       insertarEnDestino(nodoArrastrado);
      eliminarNodoOrigen();
    }
  };

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

  if (isLoading) {
    return (
      <div className="uvl-tree-editor">
        <h2>Editor de Estructura UVL</h2>
        <LoadingSpinner message="Cargando modelo..." />
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
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
          Guardar Modelo
        </button>
      </div>
    </DndContext>
  );
}