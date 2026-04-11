from django.test import TestCase, override_settings
from configurador.flamapy.flamapyService import FlamapyService
from pathlib import Path
import shutil
import tempfile
from django.core.cache import cache
from unittest.mock import patch
from rest_framework.test import APIClient
CURRENT_DIR = Path(__file__).resolve().parent
TEST_BASE_DIR = CURRENT_DIR / "test_data"
COPY_UVL_MODEL_TEST = TEST_BASE_DIR / "test_model.uvl"


class BaseTestCase(TestCase):
    def setUp(self):
        super().setUp()
        FlamapyService._instance = None
        FlamapyService._version = 0
        cache.clear()

        self.temp_dir = Path(tempfile.mkdtemp())
        self.uvl_model_test = self.temp_dir / "model.uvl"
        shutil.copy(COPY_UVL_MODEL_TEST, self.uvl_model_test)
        self.override = override_settings(UVL_MODEL_FILE=self.uvl_model_test)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.temp_dir, ignore_errors=True)
        super().tearDown()



class BaseAITestCase(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.langchain_patcher = patch('configurador.views.langchain_service')
        self.mock_langchain_service = self.langchain_patcher.start()
        self.mock_langchain_service.generate_swot_analysis.return_value = {
            "strengths": ["Fuerza de prueba"],
            "weaknesses": ["Debilidad de prueba"],
            "opportunities": ["Oportunidad de prueba"],
            "threats": ["Amenaza de prueba"]
        }
        
        self.mock_langchain_service.autocomplete_project.return_value = {
            "language": "Python",
            "description": "Descripción genérica autocompletada en prueba."
        }

    def tearDown(self):
        self.langchain_patcher.stop()
        super().tearDown()