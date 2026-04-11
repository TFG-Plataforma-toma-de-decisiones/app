from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings

from configurador.langchain.langchainService import LangchainService
from configurador.langchain.prompts import PROMPT_AUTOCOMPLETE, PROMPT_SWOT
from configurador.langchain.schemas import OSSProjectDetails, SWOTAnalysis


class LangchainServiceTests(TestCase):
    def setUp(self):
        self.service = LangchainService()

    @override_settings(TESTING_ENVIRONMENT=False)
    @patch.object(LangchainService, "generate_llm_response")
    def test_generate_swot_analysis(self, mock_generate_llm_response):
        mock_generate_llm_response.return_value = {"strengths": ["Comunidad activa"]}
        project_data = {"name": "Django", "description": "Web framework"}

        result = self.service.generate_swot_analysis(project_data)

        mock_generate_llm_response.assert_called_once_with(
            project_data,
            SWOTAnalysis,
            PROMPT_SWOT,
        )
        self.assertEqual(result, {"strengths": ["Comunidad activa"]})

    @override_settings(TESTING_ENVIRONMENT=False)
    @patch.object(LangchainService, "generate_llm_response")
    def test_autocomplete_project(self, mock_generate_llm_response):
        mock_generate_llm_response.return_value = {"language": "Python"}
        project_data = {"name": "Django"}

        result = self.service.autocomplete_project(project_data)

        mock_generate_llm_response.assert_called_once_with(
            project_data,
            OSSProjectDetails,
            PROMPT_AUTOCOMPLETE,
        )
        self.assertEqual(result, {"language": "Python"})
    @patch("configurador.langchain.langchainService.init_chat_model")
    def test_generate_llm_response(self, mock_init_chat_model):
        mock_model = MagicMock()
        mock_init_chat_model.return_value = mock_model

        mock_structured_model = MagicMock()
        mock_model.with_structured_output.return_value = mock_structured_model

        mock_prepared_model = MagicMock()
        mock_prompt = MagicMock()
        mock_prompt.__or__.return_value = mock_prepared_model

        mock_pydantic_result = MagicMock()
        mock_pydantic_result.model_dump.return_value = {"fake_key": "fake_value"}
        mock_prepared_model.invoke.return_value = mock_pydantic_result

        dummy_data = {"input": "test"}
        dummy_class = MagicMock()

        result = self.service.generate_llm_response(dummy_data, dummy_class, mock_prompt)

        mock_init_chat_model.assert_called_once()
        mock_model.with_structured_output.assert_called_once_with(dummy_class)
        mock_prepared_model.invoke.assert_called_once_with(dummy_data)
        mock_pydantic_result.model_dump.assert_called_once()
        self.assertEqual(result, {"fake_key": "fake_value"})
