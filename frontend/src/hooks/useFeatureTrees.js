import { useContext } from "react";
import { FeatureTreesContext } from "../context/FeatureTreesContext";
export function useFeatureTrees(){
  const context = useContext(FeatureTreesContext);
  if (!context) throw new Error("useUVLModel debe usarse dentro de un UVLProvider");
  return context;
}