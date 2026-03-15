# tu_app/schemas.py
from pydantic import BaseModel, Field
from typing import List

class AnalisisDAFO(BaseModel):
    fortalezas: List[str] = Field(description="Puntos fuertes técnicos, ventajas de la arquitectura y beneficios intrínsecos de combinar este framework con estas librerías.")
    oportunidades: List[str] = Field(description="Oportunidades de mejora futura, escalabilidad, o beneficios que aporta al contexto del proyecto.")
    debilidades: List[str] = Field(description="Puntos débiles, carencias, fricciones arquitectónicas o problemas de acoplamiento.")
    amenazas: List[str] = Field(description="Riesgos externos, problemas de mantenimiento a largo plazo, curva de aprendizaje o desafíos del ecosistema.")