from django.test import TestCase, override_settings
from configurador.flamapy.flamapyService import FlamapyService
from pathlib import Path
import shutil
import tempfile
from django.core.cache import cache
from django.core.management import call_command
from unittest.mock import patch
from rest_framework.test import APIClient
import json
CURRENT_DIR = Path(__file__).resolve().parent
TEST_BASE_DIR = CURRENT_DIR / "test_data"
COPY_UVL_MODEL_TEST = TEST_BASE_DIR / "test_model.uvl"
TEST_DATA_FIXTURE = TEST_BASE_DIR / "test_fixture.json"

EXPECTED_MODEL_DICT_FILE = TEST_BASE_DIR / "expected_model_dict.json"
EXPECTED_MODEL_DICT = json.loads(EXPECTED_MODEL_DICT_FILE.read_text(encoding="utf-8"))
class BaseUVLTestCase(TestCase):
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



class BaseTestCase(BaseUVLTestCase):
    def setUp(self):
        super().setUp()
        call_command("loaddata", str(TEST_DATA_FIXTURE), verbosity=0)
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
            "name":"Nombre prueba",
            "language": "Python",
            "description": "Descripción genérica autocompletada en prueba.",
            "features":["Project","Backend","ApiStyle","Rest","ORM-01"],
            "confidence_level":0.95
        }

    def tearDown(self):
        self.langchain_patcher.stop()
        super().tearDown()
