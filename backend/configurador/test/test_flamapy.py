from configurador.flamapy.flamapyService import FlamapyService
from configurador.test.base import BaseUVLTestCase, EXPECTED_MODEL_DICT


class FlamapyServiceTests(BaseUVLTestCase):
    def test_to_dict(self):
        flamapy_service = FlamapyService.get_instance()
        result = flamapy_service.to_dict()

        self.assertEqual(result, EXPECTED_MODEL_DICT)

    def test_validate_returns_false_when_full_configuration_is_missing_features(self):
        flamapy_service = FlamapyService.get_instance()
        features = ["Project", "Backend"]

        result = flamapy_service.validate(features, is_full=True)

        self.assertFalse(result)

    def test_validate_returns_true_when_partial_configuration_is_missing_features(self):
        flamapy_service = FlamapyService.get_instance()
        features = ["Project", "Backend"]

        result = flamapy_service.validate(features, is_full=False)

        self.assertTrue(result)

    def test_validate_returns_false_when_features_are_incompatible(self):
        flamapy_service = FlamapyService.get_instance()
        features = [
            "Project",
            "Backend",
            "ApiStyle",
            "Rest",
            "Frontend",
            "RenderingModel",
            "SPA",
        ]

        result = flamapy_service.validate(features, is_full=True)

        self.assertFalse(result)

    def test_validate_returns_true_when_features_are_valid(self):
        flamapy_service = FlamapyService.get_instance()
        features = ["Project", "Backend", "ApiStyle", "Rest"]

        result = flamapy_service.validate(features, is_full=True)

        self.assertTrue(result)

    def test_get_uvl_text(self):
        uvl_content = FlamapyService.get_uvl_text(EXPECTED_MODEL_DICT)
        regenerated_service = FlamapyService.create_str(uvl_content)

        self.assertEqual(regenerated_service.to_dict(), EXPECTED_MODEL_DICT)

    def test_publish_new_model(self):
        expected_new_model = "features\n\tProject\n\t\tmandatory\n\t\t\tNuevo"
        FlamapyService.publish_new_model(expected_new_model)
        with open(self.uvl_model_test, mode="r") as f:
            new_model = f.read()
        self.assertEqual(expected_new_model, new_model)

    def test_create_str(self):
        expected_service = FlamapyService.get_instance()
        with open(self.uvl_model_test, mode="r") as f:
            uvl_content = f.read()
        service = FlamapyService.create_str(uvl_content)
        self.assertEqual(expected_service.to_dict(), service.to_dict())
