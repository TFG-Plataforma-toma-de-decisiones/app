import { useContext } from "react";
import { UVLContext } from "../context/UVLContext";
export function useUVLModel(){
  const context = useContext(UVLContext);
  if (!context) throw new Error("useUVLModel debe usarse dentro de un UVLProvider");
  return context;
}