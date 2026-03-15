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
        description="Lenguaje de programación principal en el que está basado o escrito el proyecto (ej. Python, JavaScript, Java)."
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
        )
    )