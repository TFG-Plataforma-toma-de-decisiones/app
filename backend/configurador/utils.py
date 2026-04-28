def features_set_by_name(features_list):
    return set(f.split("-")[0] for f in features_list)
def aplanar_errores_uvl(errores_drf, datos_originales, path_actual=""):
    """
    Recorre los errores de validación de un modelo UVL cruzándolos con
    el request.data original para extraer los nombres de las features.
    """
    mensajes = []

    if isinstance(errores_drf, dict):
        for campo, errores in errores_drf.items():
            # Si bajamos a un nivel anidado (lista de relaciones o hijos)
            if campo in ['children', 'relations']:
                datos_hijo = datos_originales.get(campo, []) if isinstance(datos_originales, dict) else []
                mensajes.extend(aplanar_errores_uvl(errores, datos_hijo, path_actual))
            
            # Omitimos la clave interna de DRF para errores genéricos del objeto
            elif campo == 'non_field_errors':
                mensajes.extend(aplanar_errores_uvl(errores, datos_originales, path_actual))
            
            # Es un error en un campo final (ej. 'attributes', 'name')
            else:
                nuevo_path = f"{path_actual} -> {campo}" if path_actual else campo
                mensajes.extend(aplanar_errores_uvl(errores, None, nuevo_path))

    elif isinstance(errores_drf, list):
        for index, item_error in enumerate(errores_drf):
            # Ignoramos diccionarios vacíos {} que DRF pone para ítems válidos
            if isinstance(item_error, dict) and item_error:
                # Recuperamos el nodo original para robarle el nombre
                nodo_original = {}
                if isinstance(datos_originales, list) and index < len(datos_originales):
                    nodo_original = datos_originales[index]
                
                # Determinamos el nombre amigable
                if isinstance(nodo_original, dict):
                    if "name" in nodo_original:
                        nombre_nodo = f"[{nodo_original['name']}]"
                    elif "type" in nodo_original:
                        nombre_nodo = f"[Relación {nodo_original['type']}]"
                    else:
                        nombre_nodo = f"[Elemento {index + 1}]"
                else:
                    nombre_nodo = f"[Elemento {index + 1}]"
                    
                nuevo_path = f"{path_actual} -> {nombre_nodo}" if path_actual else nombre_nodo
                mensajes.extend(aplanar_errores_uvl(item_error, nodo_original, nuevo_path))
                
            # Llegamos al mensaje de error final (ErrorDetail)
            elif isinstance(item_error, str) or hasattr(item_error, 'code'):
                mensajes.append(f"{path_actual}: {str(item_error)}")
                
    else:
        # Fallback de seguridad
        mensajes.append(f"{path_actual}: {str(errores_drf)}")

    return mensajes