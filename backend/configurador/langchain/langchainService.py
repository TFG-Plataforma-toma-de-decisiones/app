from django.conf import settings
from langchain.chat_models import init_chat_model
from configurador.langchain.prompts import PROMPT_DAFO
from configurador.langchain.schemas import AnalisisDAFO
class LangchainService:
    def __init__(self):
        pass
    def generar_analisis_dafo(self,datos_proyecto: dict) -> dict:
        modelo = init_chat_model(
            model=settings.LLM_MODEL, 
            model_provider=settings.LLM_PROVIDER,
            temperature=settings.LLM_TEMPERATURE
        )
        modelo_estructurado = modelo.with_structured_output(AnalisisDAFO)
        cadena = PROMPT_DAFO | modelo_estructurado

        resultado_pydantic = cadena.invoke({
            "user_features": datos_proyecto.get("user_features"),
            "user_comments": datos_proyecto.get("user_comments"),
            "framework_name": datos_proyecto.get("framework_name"),
            "libraries_list": datos_proyecto.get("libraries_list"),
            "project_features_details": datos_proyecto.get("project_features_details"),
            "uvl_model": datos_proyecto.get("uvl_model"),
        })

        return resultado_pydantic.model_dump()
langchain_service=LangchainService()