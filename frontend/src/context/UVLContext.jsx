import React, { createContext, useState } from 'react';
import useAxios from '../hooks/useAxios';
export const UVLContext = createContext();

export default function UVLProvider({ children,readOnly }) {
  const {data} =useAxios("/model",{})
  const [features,setFeatures]=useState([])
  function subtreeFeatures(feature,mandatory){
    let subtree=[feature.name]
    for(const child of feature.children){
      if(!mandatory || child.relationship=="MANDATORY"){
        subtree=subtree.concat(subtreeFeatures(child,mandatory));
      }
    }
    return subtree    
  }
  function addFeature(feature){
    const mandatoryFeatures=subtreeFeatures(feature,true)
    console.log(mandatoryFeatures)
    setFeatures(prevFeatures=>prevFeatures.concat(mandatoryFeatures))
  }
  function removeFeature(feature){
    const subtree=subtreeFeatures(feature,false)
    setFeatures(prevFeatures=>prevFeatures.filter(f => !subtree.includes(f)))
  }
  function handleToggle(feature){
   
    if (features.includes(feature.name)){
        removeFeature(feature)
    }
    else{
        addFeature(feature)
    }
  }
  function handleRadioChange(alternativeGroup, feature) {
    if (features.includes(feature.name)) {
      removeFeature(feature)
    } else {
      const activeFeature=alternativeGroup.find(f=>features.includes(f.name))
      console.log(activeFeature)
      if (activeFeature){

        removeFeature(activeFeature)
      }
      addFeature(feature)
    }
  }
  function isActive(feature){
    return features.includes(feature)
  }
  const value={uvlModel:data,handleToggle,handleRadioChange,isActive,features,setFeatures,readOnly}
  return (
    <UVLContext.Provider value={value}>
      {children}
    </UVLContext.Provider>
  );
}

