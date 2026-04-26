import './FeatureNode.css';
import { useFeatureTrees } from "../../hooks/useFeatureTrees";
import { getRelations, hasRelations } from "../../utils/featureModel";

const RELATION_CONFIG = {
  MANDATORY: { title: null, controlType: "mandatory" },
  ALTERNATIVE: { title: "Selecciona uno", controlType: "radio" },
  OR: { title: "Selecciona al menos uno", controlType: "checkbox" },
  OPTIONAL: { title: "Características opcionales", controlType: "checkbox" }
};

const DEFAULT_RELATION_CONFIG = {
  title: null,
  controlType: "checkbox"
};

const MERGEABLE_RELATION_TYPES = new Set(["MANDATORY", "OPTIONAL"]);


export default function FeatureNode({ node, depth = 0, index = 0, readOnly,fullConfig=true }) {
  const { isActive, handleToggle, handleRadioChange } = useFeatureTrees();

  const relations = getRelations(node);
  if (!relations.length) return null;

  

  const displayRelations = relations.reduce((groupedRelations, relation) => {
    if (!MERGEABLE_RELATION_TYPES.has(relation.type)) {
      groupedRelations.push(relation);
      return groupedRelations;
    }

    const existingRelation = groupedRelations.find(
      (groupedRelation) => groupedRelation.type === relation.type
    );

    if (!existingRelation) {
      groupedRelations.push({
        ...relation,
        children: [...(relation.children ?? [])]
      });
      return groupedRelations;
    }

    existingRelation.children = existingRelation.children.concat(relation.children ?? []);
    return groupedRelations;
  }, []);

  return (
    <div className={`uvl-configurator ${readOnly ? 'readonly-mode' : ''}`}>
      {displayRelations.map((relation, relationIndex) => {
        const children = relation.children ?? [];
        if (!children.length) return null;

        const { title, controlType } = RELATION_CONFIG[relation.type];

        return (
          <div
            key={`${node.name}-${relation.type}-${relationIndex}`}
            className={`feature-group ${depth > 0 ? 'feature-group--nested' : ''} ${depth > 1 ? 'feature-group--deep' : ''}`}
          >
            {!readOnly && title && <h3 className="section-title">{title}</h3>}
            
            {children.map(child => {
              const isMandatory = controlType === "mandatory";
              const active = isMandatory ? true : isActive(index, child);
              const hasChildren = hasRelations(child);
              const id = `control-${child.name.replace(/\s+/g, '-')}`;
              const featureDataCy = `feature-${child.name.replace(/\s+/g, '-')}`;
              let control = null;

              if (isMandatory) {
                control = (
                  <span className="mandatory-indicator">
                    <div className="mandatory-dot"></div>
                  </span>
                );
              } else if (controlType === "radio") {
                control = (
                  <>
                    <input
                      type="radio"
                      id={id}
                      name={`group-${node.name?.split('-')?.[0]}-${relationIndex}`}
                      checked={active}
                      disabled={readOnly}
                      onChange={() => {}}
                      onClick={() => {
                        console.log(fullConfig)
                        if(!active || !fullConfig){
                          handleRadioChange(index, children, child)
                          }
                        }
                      }
                    />
                    <span className="custom-control custom-radio"></span>
                  </>
                );
              } else if (controlType === "checkbox") {
                const checkedCount = children.filter(c => isActive(index, c)).length;
                const disabled = (relation.type === "OR" && active && checkedCount === 1 && fullConfig) || readOnly;

                control = (
                  <>
                    <input
                      type="checkbox"
                      id={id}
                      checked={active}
                      disabled={disabled}
                      onChange={() => handleToggle(index, child)}
                    />
                    <span className="custom-control custom-checkbox"></span>
                  </>
                );
              }

              return (
                <div key={child.name} className={`feature-card ${active ? 'active' : ''} ${isMandatory ? 'mandatory' : ''}`}>
                  <label className="feature-header" data-cy={featureDataCy}>
                    {control}
                    <span className="feature-name">{child.name?.split("-")?.[0]}</span>
                  </label>
                  {active && hasChildren && (
                    <div className="feature-children">
                      <FeatureNode node={child} depth={depth + 1} index={index} readOnly={readOnly} fullConfig={fullConfig}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
