from django.test import TestCase, override_settings

from configurador.langchain.langchainService import MockLangchainService
from configurador.tasks import autocomplete_project_task, generate_swot_task


class TaskTests(TestCase):
    def setUp(self):
        super().setUp()
        self.testing_override = override_settings(TESTING_ENVIRONMENT=True)
        self.testing_override.enable()
        self.mock_langchain_service = MockLangchainService()

    def tearDown(self):
        self.testing_override.disable()
        super().tearDown()

    def test_generate_swot_task_returns_testing_mock_result(self):
        data = {"project": "Flask"}

        result = generate_swot_task.run(data)

        self.assertEqual(
            result,
            self.mock_langchain_service.generate_swot_analysis(data),
        )

    def test_autocomplete_project_task_returns_testing_mock_result(self):
        data = {"name": "Flask"}

        result = autocomplete_project_task.run(data)

        self.assertEqual(
            result,
            self.mock_langchain_service.autocomplete_project(data),
        )
