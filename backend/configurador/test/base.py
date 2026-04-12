import json
import shutil
import tempfile
from pathlib import Path

from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase, override_settings

from configurador.flamapy.flamapyService import FlamapyService

CURRENT_DIR = Path(__file__).resolve().parent
TEST_BASE_DIR = CURRENT_DIR / "test_data"
COPY_UVL_MODEL_TEST = TEST_BASE_DIR / "test_model_backup.uvl"
UVL_MODEL_TEST = TEST_BASE_DIR / "test_model.uvl"
TEST_DATA_FIXTURE = TEST_BASE_DIR / "test_fixture.json"
EXPECTED_MODEL_DICT_FILE = TEST_BASE_DIR / "expected_model_dict.json"
EXPECTED_MODEL_DICT = json.loads(EXPECTED_MODEL_DICT_FILE.read_text(encoding="utf-8"))


class BaseUVLTestCase(TestCase):
    def setUp(self):
        super().setUp()
        FlamapyService._instance = None
        FlamapyService._version = 0
        cache.clear()
        self.uvl_model_test = UVL_MODEL_TEST
        shutil.copy(COPY_UVL_MODEL_TEST, self.uvl_model_test)
        self.override = override_settings(UVL_MODEL_FILE=self.uvl_model_test)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        super().tearDown()


class BaseTestCase(BaseUVLTestCase):
    def setUp(self):
        super().setUp()
        self.testing_override = override_settings(TESTING_ENVIRONMENT=True)
        self.testing_override.enable()
        call_command("loaddata", str(TEST_DATA_FIXTURE), verbosity=0)

    def tearDown(self):
        self.testing_override.disable()
        super().tearDown()
