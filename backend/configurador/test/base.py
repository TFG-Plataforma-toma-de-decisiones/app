from django.test import TestCase, override_settings
from configurador.flamapy.flamapyService import FlamapyService
from pathlib import Path
import shutil
import tempfile
from django.core.cache import cache
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