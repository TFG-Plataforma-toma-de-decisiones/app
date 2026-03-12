import React, { createContext, useState } from 'react';
import useAxios from '../hooks/useAxios';
export const UVLContext = createContext();

export default function UVLProvider({ children,readOnly }) {
  const {data} =useAxios("/model",{})
  const [features,setFeatures]=useState([])
  function subtreeFeatures(feature){
    let subtree=[feature.name]
    for(const child of feature.children){
      subtree+=subtree.concat(subtreeFeatures(child));
    }
    return subtree    
  }
  function removeFeature(feature){
    const subtree=subtreeFeatures(feature)
    setFeatures(features.filter(f => !subtree.includes(f)))
  }
  function handleToggle(feature){
   
    if (features.includes(feature.name)){
        removeFeature(feature)
    }
    else{
        setFeatures([...features,feature.name])
    }
  }
  function handleRadioChange(alternativeGroup, feature) {
    console.log(alternativeGroup)
    console.log(feature)
    console.log(features)
    if (features.includes(feature.name)) {
      removeFeature(feature)
    } else {
      const activeFeature=alternativeGroup.find(f=>features.includes(f.name))
      console.log(activeFeature)
      if (activeFeature!=null){

        removeFeature(activeFeature)
      }
      setFeatures(prevFeatures=>[...prevFeatures,feature.name])
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

