from pydantic import BaseModel, Field
from typing import List

class SWOTAnalisis(BaseModel):
    strengths: List[str] = Field(description="Puntos fuertes técnicos, ventajas de la arquitectura y beneficios intrínsecos de combinar este framework con estas librerías.")
    opportunities: List[str] = Field(description="Oportunidades de mejora futura, escalabilidad, o beneficios que aporta al contexto del proyecto.")
    weaknesses: List[str] = Field(description="Puntos débiles, carencias, fricciones arquitectónicas o problemas de acoplamiento.")
    threats: List[str] = Field(description="Riesgos externos, problemas de mantenimiento a largo plazo, curva de aprendizaje o desafíos del ecosistema.")