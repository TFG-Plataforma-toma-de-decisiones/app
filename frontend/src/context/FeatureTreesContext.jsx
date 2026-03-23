import { createContext, useState,useEffect } from "react";
import { collectFeatureNames } from "../utils/featureModel";

export const FeatureTreesContext = createContext();

export default function FeatureTreesProvider({ children, initialTrees = [] }) {
  const [trees, setTrees] = useState(initialTrees);
  useEffect(() => {
    setTrees(initialTrees);
  }, [initialTrees]);

  const addFeature = (index, feature) => {
    const mandatoryFeatures = collectFeatureNames(feature, true);
    setTrees(prev=>{
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        features: [...new Set(prev[index].features.concat(mandatoryFeatures))]
      };
      return copy;
    })
  };

  const removeFeature = (index, feature) => {
    const subtree = collectFeatureNames(feature, false);
    setTrees(prev=>{
      const copy = [...prev];
      copy[index] = { ...copy[index], features:prev[index].features.filter(f=>!subtree.includes(f)) };
      return copy;
    })
  };

  const handleToggle = (index, feature) => {
    const currentFeatures = trees[index].features || [];
    currentFeatures.includes(feature.name) ? removeFeature(index, feature) : addFeature(index, feature);
  };

  const handleRadioChange = (index, alternativeGroup, feature) => {
    const currentFeatures = trees[index].features || [];
    if(currentFeatures.includes(feature.name)){
      removeFeature(index,feature)
      return ;
    }
    const activeFeature = alternativeGroup.find(f => currentFeatures.includes(f.name));
    if (activeFeature) removeFeature(index, activeFeature);
    addFeature(index, feature);
  };

  const isActive = (index, feature) => {
    return trees[index].features?.includes(feature.name);
  };
  const getProperty=(index,property)=>{
    return trees[index][property]
  }
  const setProperty=(index,property,value)=>{
    setTrees(prev=>{
      const copy = [...prev];
      copy[index] = { ...copy[index], [property]: value };
      return copy;
    })
  }

  return (
    <FeatureTreesContext.Provider value={{
      trees,
      setTrees,
      handleToggle,
      handleRadioChange,
      isActive,
      getProperty,
      setProperty
    }}>
      {children}
    </FeatureTreesContext.Provider>
  );
}
