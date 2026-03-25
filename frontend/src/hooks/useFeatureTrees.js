import { useContext } from "react";
import { FeatureTreesContext } from "../context/FeatureTreesContext";
export function useFeatureTrees(){
  const context = useContext(FeatureTreesContext);
  if (!context) throw new Error("useFeatureTrees debe usarse dentro de un FeatureTreesProvider");
  return context;
}