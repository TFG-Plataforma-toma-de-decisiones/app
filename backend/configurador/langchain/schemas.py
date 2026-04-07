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
        description="Descripción técnica, objetiva y detallada del proyecto, orientada a su propósito arquitectónico y ventajas."
    )
    language: str = Field(
        description=(
            "Lenguaje de programación principal en el que está escrito el proyecto. "
            "REGLA DE CONSISTENCIA: Comprueba la lista de 'LENGUAJES EXISTENTES' proporcionada en el contexto. "
            "Si el lenguaje ya existe en esa lista, DEBES usar esa cadena de texto EXACTA (respetando mayúsculas y minúsculas). "
            "Solo si el lenguaje no existe en la lista, proporciona el nombre estándar capitalizado (ej. 'Python', 'C#', 'TypeScript')."
        )
    )
    features: List[str] = Field(
        description=(
            "Lista de características (features) que este proyecto satisface, ya sea de forma nativa o mediante sus integraciones/plugins oficiales. "
            "REGLAS CRÍTICAS DE RESTRICCIÓN (UVL):\n"
            "1. Identificadores exactos: Usa solo los nombres tal y como aparecen en el modelo UVL proporcionado. No inventes ni modifiques términos.\n"
            "2. Semántica 'alternative' (Exclusividad Mutua): Si un nodo padre agrupa a sus hijos bajo la relación 'alternative', "
            "ESTÁ ESTRICTAMENTE PROHIBIDO seleccionar más de un hijo de ese grupo. Debes elegir EXACTAMENTE UNO que represente la opción más estándar, principal o representativa del proyecto en ese ámbito.\n"
            "3. Semántica 'or': Si la relación es 'or', puedes elegir uno o varios hijos del grupo.\n"
            "4. Coherencia estructural: No violes la jerarquía ni la exclusividad del árbol. Prioriza la precisión lógica del modelo UVL sobre la exhaustividad del framework."
            "5. Debes asegurarte de incluir un modelo UVL válido añadiendo todas las feature mandatory intermedias que sean necesarias."
        )
    )
    confidence_score: float = Field(
        description=(
            "Nivel de confianza de la predicción, expresado como un valor decimal entre 0.0 y 1.0. "
            "REGLAS DE PUNTUACIÓN:\n"
            "- Asigna entre 0.9 y 1.0 SOLO SI los datos iniciales son coherentes entre sí y la identificación es unívoca.\n"
            "- Asigna entre 0.5 y 0.8 si la entrada es escasa, ambigua, o REGLA CRÍTICA: si existen CONTRADICCIONES EXPLÍCITAS en los datos del usuario . En caso de contradicción, debes autocorregir los datos hacia la opción lógica, pero ESTÁS OBLIGADO a bajar la puntuación a este rango para forzar una revisión humana.\n"
            "- Asigna un valor MENOR a 0.5 si los datos proporcionados carecen de sentido y te ves obligado a generar datos por defecto."
        )
    )