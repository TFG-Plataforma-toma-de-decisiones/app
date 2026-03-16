import './FeatureNode.css';
import { useFeatureTrees } from "../hooks/useFeatureTrees";

const GROUPS = [
  { key: "MANDATORY", title: null, controlType: "mandatory" },
  { key: "ALTERNATIVE", title: "Alternative (Select exactly one)", controlType: "radio" },
  { key: "OR", title: "OR (Select at least one)", controlType: "checkbox" },
  { key: "OPTIONAL", title: "Optional Features", controlType: "checkbox" }
];

export default function FeatureNode({ node, depth = 0, index = 0, readOnly }) {
  const { isActive, handleToggle, handleRadioChange } = useFeatureTrees();
  
  if (!node.children?.length) return null;

  const groupedChildren = node.children.reduce((acc, child) => {
    const rel = child.relationship;
    if (!acc[rel]) acc[rel] = [];
    acc[rel].push(child);
    return acc;
  }, {});

  return (
    <div className={`uvl-configurator ${readOnly ? 'readonly-mode' : ''}`}>
      {GROUPS.map(({ key, title, controlType }) => {
        const children = groupedChildren[key];
        if (!children) return null;

        return (
          <div key={key} className="feature-group">
            {!readOnly && title && <h3 className="section-title">{title}</h3>}
            
            {children.map(child => {
              const isMandatory = controlType === "mandatory";
              const active = isMandatory ? true : isActive(index, child);
              const hasChildren = child.children?.length > 0;
              const id = `control-${child.name.replace(/\s+/g, '-')}`;
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
                      name={`group-${node.name}`}
                      checked={active}
                      disabled={readOnly}
                      onChange={() => handleRadioChange(index, children, child)}
                    />
                    <span className="custom-control custom-radio"></span>
                  </>
                );
              } else if (controlType === "checkbox") {
                const checkedCount = children.filter(c => isActive(index, c)).length;
                const disabled = (key === "OR" && active && checkedCount === 1) || readOnly;

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
                  <label className="feature-header">
                    {control}
                    <span className="feature-name">{child.name}</span>
                  </label>
                  {active && hasChildren && (
                    <div className="feature-children">
                      <FeatureNode node={child} depth={depth + 1} index={index} readOnly={readOnly}/>
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