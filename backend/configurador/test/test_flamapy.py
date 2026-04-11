import json

from configurador.flamapy.flamapyService import FlamapyService
from configurador.test.base import BaseTestCase, TEST_BASE_DIR

EXPECTED_MODEL_DICT_TEST = TEST_BASE_DIR / "expected_model_dict.json"
EXPECTED_MODEL_DICT = json.loads(EXPECTED_MODEL_DICT_TEST.read_text(encoding="utf-8"))


class FlamapyServiceTests(BaseTestCase):
    def test_to_dict(self):
        flamapy_service = FlamapyService.get_instance()
        result = flamapy_service.to_dict()

        self.assertEqual(result, EXPECTED_MODEL_DICT)
    
