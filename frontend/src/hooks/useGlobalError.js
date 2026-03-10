import { useContext } from "react";
import {ErrorContext} from "../context/ErrorContext"
export const useGlobalError = () => {
  const context = useContext(ErrorContext);
  if (!context) throw new Error("useGlobalError debe usarse dentro de un ErrorProvider");
  return context;
};