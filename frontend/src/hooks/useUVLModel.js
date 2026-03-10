import useAxios from "./useAxios" 
export default function useUVLModel(){
    const {data,setData} =useAxios("/model",{})
    return {uvlModel:data,setUVlModel:setData}
}