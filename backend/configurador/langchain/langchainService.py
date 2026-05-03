from django.conf import settings
from langchain.chat_models import init_chat_model
from configurador.langchain.prompts import PROMPT_SWOT,PROMPT_AUTOCOMPLETE
from configurador.langchain.schemas import SWOTAnalysis,OSSProjectDetails

class LangchainService:
    def __init__(self):
        pass
        
    def generate_llm_response(self, data, output_class, prompt):
        model = init_chat_model(
            model=settings.LLM_MODEL, 
            model_provider=settings.LLM_PROVIDER,
            temperature=settings.LLM_TEMPERATURE
        )
        structured_model = model.with_structured_output(output_class)
        prepared_model = prompt | structured_model
        pydantic_result = prepared_model.invoke(data)
        return pydantic_result.model_dump()
        
    def generate_swot_analysis(self, project_data):
        return self.generate_llm_response(project_data, SWOTAnalysis, PROMPT_SWOT)
        
    def autocomplete_project(self, project_data):
        return self.generate_llm_response(project_data, OSSProjectDetails, PROMPT_AUTOCOMPLETE)
class MockLangchainService:
    def generate_swot_analysis(self, project_data):
        return {
            "strengths": ["Fuerza de prueba"],
            "weaknesses": ["Debilidad de prueba"],
            "opportunities": ["Oportunidad de prueba"],
            "threats": ["Amenaza de prueba"]
        }
        
    def autocomplete_project(self, project_data):
        return {
            "name": "Nombre prueba",
            "language": "Python",
            "description": "Descripcion generica autocompletada en prueba.",
            "features": ["Project", "Backend", "ApiStyle", "Rest", "ORM-01"],
            "confidence_level": 0.95,
            "compatible_projects":["Django"]
        }
def get_langchain_service():
    if getattr(settings, 'TESTING_ENVIRONMENT', False):
        return MockLangchainService()
    return LangchainService()