from pydantic import BaseModel, Field
from typing import List

class SWOTAnalysis(BaseModel):
    strengths: List[str] = Field(description="Puntos fuertes técnicos, ventajas de la arquitectura y beneficios intrínsecos de combinar este framework con estas librerías.")
    opportunities: List[str] = Field(description="Oportunidades de mejora futura, escalabilidad, o beneficios que aporta al contexto del proyecto.")
    weaknesses: List[str] = Field(description="Puntos débiles, carencias, fricciones arquitectónicas o problemas de acoplamiento.")
    threats: List[str] = Field(description="Riesgos externos, problemas de mantenimiento a largo plazo, curva de aprendizaje o desafíos del ecosistema.")
class OSSProjectDetails(BaseModel):
    name: str = Field(
        description="Nombre oficial de la tecnología o proyecto Open Source (ej. Django, React, PostgreSQL)."
    )

    description: str = Field(
        description=(
            "Descripción técnica, objetiva y detallada del proyecto, orientada a su propósito "
            "arquitectónico, capacidades principales y ventajas."
        )
    )

    language: str = Field(
        description=(
            "Lenguaje de programación principal en el que está escrito el proyecto. "
            "REGLA DE CONSISTENCIA: Comprueba la lista de 'LENGUAJES EXISTENTES' proporcionada en el contexto. "
            "Si el lenguaje ya existe en esa lista, DEBES usar esa cadena de texto EXACTA "
            "(respetando mayúsculas y minúsculas). "
            "Solo si el lenguaje no existe en la lista, proporciona el nombre estándar capitalizado "
            "(ej. 'Python', 'C#', 'TypeScript')."
        )
    )

    features: List[str] = Field(
        description=(
            "Lista de características (features) que este proyecto satisface. "
            "REGLAS CRÍTICAS DE RESTRICCIÓN (UVL):\n"
            "1. Identificadores exactos: usa solo los nombres tal y como aparecen en el modelo UVL proporcionado. "
            "No inventes ni modifiques términos.\n"
            "2. Semántica 'alternative': si un nodo padre agrupa a sus hijos bajo la relación 'alternative', "
            "ESTÁ ESTRICTAMENTE PROHIBIDO seleccionar más de un hijo de ese grupo. Debes elegir EXACTAMENTE UNO.\n"
            "3. Semántica 'or': si la relación es 'or', puedes elegir uno o varios hijos del grupo.\n"
            "4. Coherencia estructural: no violes la jerarquía ni la exclusividad del árbol. "
            "Prioriza la precisión lógica del modelo UVL sobre la exhaustividad.\n"
            "5. Debes asegurarte de incluir un modelo UVL válido añadiendo todas las feature mandatory "
            "intermedias que sean necesarias.\n"
            "6. REGLA DE ATRIBUCIÓN: solo debes asignar una feature al proyecto si la capacidad forma parte "
            "de la oferta oficial principal del propio proyecto.\n"
            "7. También puedes asignarla si la capacidad se ofrece mediante módulos oficiales del mismo "
            "platform project, distribución principal o release train, y esa capacidad no se modela como "
            "proyecto separado en la base de datos.\n"
            "8. NO debes asignar una feature al proyecto base si para obtenerla es necesario apoyarse en un "
            "proyecto, paquete o librería separada con identidad propia que pueda modelarse como entrada "
            "independiente en la base de datos.\n"
            "9. Si una capacidad pertenece a un proyecto separado del ecosistema, esa capacidad NO debe "
            "incluirse en `features` del proyecto base; debe modelarse en el proyecto/librería separado "
            "correspondiente.\n"
            "10. La existencia de una librería compatible NO convierte automáticamente esa capacidad en una "
            "feature del proyecto base."
        )
    )

    compatible_projects: List[str] = Field(
        default_factory=list,
        description=(
            "Lista de nombres exactos de proyectos existentes en la base de datos con los que esta tecnología "
            "es específicamente compatible. "
            "Usa este campo cuando la tecnología sea una librería ('Backend Library' o 'Frontend Library'). "
            "En caso contrario devuelve [].\n"
            "REGLAS:\n"
            "1. Usa EXCLUSIVAMENTE nombres que existan en 'PROYECTOS EXISTENTES EN LA BASE DE DATOS'.\n"
            "2. No inventes nombres ni variantes.\n"
            "3. Si la librería es genérica del lenguaje o del ecosistema y no está ligada claramente a un "
            "framework o proyecto concreto, devuelve [].\n"
            "4. No incluyas proyectos solo porque la librería pueda usarse técnicamente con ellos.\n"
            "5. Solo incluye proyectos cuando la librería sea una extensión clara, integración específica o "
            "complemento directo de ese framework o proyecto.\n"
            "6. La compatibilidad no depende de que el proyecto tenga el mismo tipo funcional; depende de que "
            "la librería esté ligada claramente a ese proyecto concreto.\n"
            "7. La existencia de `compatible_projects` no implica que las features de la librería deban "
            "atribuirse al proyecto base.\n"
            "8. Si la tecnología no es una librería, devuelve []."
        )
    )

    confidence_score: float = Field(
        description=(
            "Nivel de confianza de la predicción, expresado como un valor decimal entre 0.0 y 1.0.\n"
            "REGLAS DE PUNTUACIÓN:\n"
            "- Asigna entre 0.9 y 1.0 SOLO SI los datos iniciales son coherentes entre sí y la identificación es unívoca.\n"
            "- Asigna entre 0.5 y 0.8 si la entrada es escasa, ambigua, o si existen contradicciones explícitas "
            "en los datos del usuario. En caso de contradicción, debes autocorregir los datos hacia la opción "
            "lógica, pero debes bajar la puntuación a este rango para forzar una revisión humana.\n"
            "- Asigna un valor menor a 0.5 si los datos proporcionados carecen de sentido y te ves obligado a "
            "generar datos por defecto."
        )
    )