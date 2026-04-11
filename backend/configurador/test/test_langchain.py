from django.test import TestCase
from unittest.mock import patch, MagicMock

# Ajusta estas importaciones a la ruta real de tu aplicación
from configurador.langchain.prompts import PROMPT_SWOT, PROMPT_AUTOCOMPLETE
from configurador.langchain.schemas import SWOTAnalysis, OSSProjectDetails
from configurador.langchain.langchainService import LangchainService # Cambia "tu_app" por tu módulo real

class LangchainServiceTests(TestCase):
    def setUp(self):
        self.service = LangchainService()
    @patch.object(LangchainService, 'generate_llm_response')
    def test_generate_swot_analysis(self, mock_generate_llm_response):
        """Prueba que el análisis SWOT llama al core con los parámetros correctos."""
        
        # 1. Preparamos el resultado simulado
        mock_generate_llm_response.return_value = {"strengths": ["Comunidad activa"]}
        project_data = {"name": "Django", "description": "Web framework"}
        
        # 2. Ejecutamos el método
        resultado = self.service.generate_swot_analysis(project_data)
        
        # 3. Verificamos que se llamó a generate_llm_response con las constantes correctas
        mock_generate_llm_response.assert_called_once_with(
            project_data, 
            SWOTAnalysis, 
            PROMPT_SWOT
        )
        self.assertEqual(resultado, {"strengths": ["Comunidad activa"]})

    @patch.object(LangchainService, 'generate_llm_response')
    def test_autocomplete_project(self, mock_generate_llm_response):
        """Prueba que el autocompletado llama al core con los parámetros correctos."""
        
        mock_generate_llm_response.return_value = {"language": "Python"}
        project_data = {"name": "Django"}
        
        resultado = self.service.autocomplete_project(project_data)
        
        mock_generate_llm_response.assert_called_once_with(
            project_data, 
            OSSProjectDetails, 
            PROMPT_AUTOCOMPLETE
        )
        self.assertEqual(resultado, {"language": "Python"})
    @patch('configurador.langchain.langchainService.init_chat_model') 
    def test_generate_llm_response(self, mock_init_chat_model):
        """Prueba la construcción de la cadena de Langchain y la extracción de datos."""
        
        # -- Configuración del Mock de Langchain --
        
        # 1. Simulamos el modelo base
        mock_model = MagicMock()
        mock_init_chat_model.return_value = mock_model
        
        # 2. Simulamos el modelo con output estructurado
        mock_structured_model = MagicMock()
        mock_model.with_structured_output.return_value = mock_structured_model
        
        # 3. Simulamos la cadena preparada (resultado de prompt | structured_model)
        mock_prepared_model = MagicMock()
        
        # 4. Simulamos el prompt. Cuando se use el operador OR (|), devolvemos nuestra cadena simulada
        mock_prompt = MagicMock()
        mock_prompt.__or__.return_value = mock_prepared_model
        
        # 5. Simulamos el resultado final (El objeto Pydantic)
        mock_pydantic_result = MagicMock()
        mock_pydantic_result.model_dump.return_value = {"fake_key": "fake_value"}
        
        # Conectamos la invocación al resultado Pydantic
        mock_prepared_model.invoke.return_value = mock_pydantic_result

        # -- Ejecución de la prueba --
        
        dummy_data = {"input": "test"}
        dummy_class = MagicMock() # Representa tu esquema Pydantic
        
        resultado = self.service.generate_llm_response(dummy_data, dummy_class, mock_prompt)
        
        # -- Verificaciones --
        
        # Verificamos que se inicializó el modelo
        mock_init_chat_model.assert_called_once()
        
        # Verificamos que se aplicó la clase Pydantic
        mock_model.with_structured_output.assert_called_once_with(dummy_class)
        
        # Verificamos que se llamó a invoke con la data
        mock_prepared_model.invoke.assert_called_once_with(dummy_data)
        
        # Verificamos que se extrajo el diccionario correctamente
        mock_pydantic_result.model_dump.assert_called_once()
        self.assertEqual(resultado, {"fake_key": "fake_value"})