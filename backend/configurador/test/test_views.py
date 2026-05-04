from types import SimpleNamespace
from unittest.mock import patch

from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient

from configurador.flamapy.flamapyService import FlamapyService
from configurador.models import Project, User, UVLModel
from configurador.test.base import BaseTestCase, BaseUVLTestCase, EXPECTED_MODEL_DICT
import json

def create_admin_user():
    return User.objects.create_user(
        username="admin",
        password="test-password",
        is_staff=True,
    )


class APIClientMixin:
    def setUp(self):
        super().setUp()
        self.client = APIClient()

    def authenticate_admin(self):
        self.client.force_authenticate(user=self.admin_user)


class ModelViewsTests(APIClientMixin, BaseUVLTestCase):
    def test_get_uvl_returns_model_dict(self):
        response = self.client.get(reverse("get_uvl"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, EXPECTED_MODEL_DICT)
class ProjectsNameList(APIClientMixin, BaseTestCase):
    def test_get_uvl_returns_model_dict(self):
        response = self.client.get(reverse("projects_name"))

        self.assertEqual(response.status_code, 200)
        self.assertIn("Django",response.data)
        self.assertTrue(not "Django Channels" in response.data)

class UserViewsTests(APIClientMixin, BaseUVLTestCase):
    def setUp(self):
        super().setUp()
        self.admin_user = create_admin_user()

    def test_get_my_user_returns_staff_flag(self):
        self.authenticate_admin()

        response = self.client.get(reverse("get_my_user"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"is_staff": True})


class LanguageViewSetTests(APIClientMixin, BaseTestCase):
    def setUp(self):
        super().setUp()
        self.admin_user = create_admin_user()

    def test_language_list_returns_languages(self):
        response = self.client.get(reverse("language-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {language["name"] for language in response.data},
            {"Python", "JavaScript"},
        )

    def test_language_create_requires_admin_user(self):
        response = self.client.post(
            reverse("language-list"),
            {"name": "Ruby"},
            format="json",
        )

        self.assertIn(response.status_code, [401, 403])

    def test_language_create_allows_admin_user(self):
        self.authenticate_admin()

        response = self.client.post(
            reverse("language-list"),
            {"name": "Ruby"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "Ruby")


class ProjectViewSetTests(APIClientMixin, BaseTestCase):
    def setUp(self):
        super().setUp()
        self.admin_user = create_admin_user()

    def test_project_create_allows_admin_user_with_valid_features(self):
        self.authenticate_admin()

        response = self.client.post(
            reverse("project-list"),
            {
                "name": "FastAPI",
                "description": "Backend API framework.",
                "language": "Python",
                "features": ["Project", "Backend", "ApiStyle", "Rest"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "FastAPI")

    def test_project_create_rejects_invalid_features(self):
        self.authenticate_admin()

        response = self.client.post(
            reverse("project-list"),
            {
                "name": "Invalid project",
                "description": "Invalid feature selection.",
                "language": "Python",
                "features": ["Project", "Backend"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
    def test_delete_project_allows_admin_user(self):
        self.authenticate_admin()

        response = self.client.delete(
            reverse("project-list")+"/1",
            format="json",
        )
        self.assertEqual(response.status_code,204)
    def test_delete_project_deletes_orphan_dependant_project(self):
        self.authenticate_admin()

        response = self.client.delete(
            reverse("project-list")+"/6",
            format="json",
        )
        self.assertEqual(response.status_code,204)   
        self.assertTrue(not Project.objects.filter(name="Django Channels").exists())


class RecommendationViewTests(APIClientMixin, BaseTestCase):
    def test_recommendation_throw_error_when_invalid_configuration(self):
        response = self.client.post(
            reverse("recommend"),
            [
                {
                    "type": "Backend",
                    "languages": ["Python"],
                    "features": [
                        "Project",
                        "Backend",
                        "ApiStyle",
                        "Rest",
                        "ORM-03",
                    ],
                }
            ],
            format="json",
        )

        self.assertEqual(response.status_code, 400)
    def test_recommendation_uses_backend_library_to_cover_missing_features(self):
        response = self.client.post(
            reverse("recommend"),
            [
                {
                    "type": "Backend",
                    "languages": ["Python"],
                    "features": [
                        "Project",
                        "Backend",
                        "ApiStyle",
                        "Rest",
                        "ORM-01",
                    ],
                }
            ],
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn(
            {
                "type": "Backend",
                "project": "Flask",
                "libraries": ["SQLAlchemy"],
            },
            response.data,
        )
    def test_recommendation_uses_backend_library_to_cover_missing_features_if_compatible(self):
        response = self.client.post(
            reverse("recommend"),
            [
                {
                    "type": "Backend",
                    "languages": ["Python"],
                    "features": [
                        "Project",
                        "Backend",
                        "ApiStyle",
                        "Rest",
                        "ORM-01",
                        "WebSockets-01"
                    ],
                }
            ],
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(not
            {
                "type": "Backend",
                "project": "Flask",
                "libraries": ["SQLAlchemy"],
            } in 
            response.data,
        )
        self.assertIn(
            {
                "type": "Backend",
                "project": "Django",
                "libraries": ["Django Channels"],
            },
            response.data,
        )


class AITaskViewTests(APIClientMixin, BaseTestCase):
    @patch("configurador.views.generate_swot_task.delay")
    def test_get_swot_dispatches_task_with_expected_data(self, mock_delay):
        mock_delay.return_value = SimpleNamespace(id="swot-task-id")

        response = self.client.post(
            reverse("get_swot"),
            {
                "preferences": ["ORM-03"],
                "comments": "Necesito persistencia.",
                "recommendations": [
                    {
                        "project": "Flask",
                        "libraries": ["SQLAlchemy"],
                    }
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.data, {"task_id": "swot-task-id"})
        task_data = mock_delay.call_args.args[0]
        self.assertEqual(task_data["uvl_model"], EXPECTED_MODEL_DICT)
        self.assertEqual(task_data["user_features"], ["ORM-03"])
        self.assertEqual(task_data["user_comments"], "Necesito persistencia.")
        self.assertEqual(
            {project["name"] for project in task_data["project_features_details"]},
            {"Flask", "SQLAlchemy"},
        )

    @patch("configurador.views.autocomplete_project_task.delay")
    def test_autocomplete_dispatches_task_with_expected_data(self, mock_delay):
        mock_delay.return_value = SimpleNamespace(id="autocomplete-task-id")

        response = self.client.post(
            reverse("get_autocomplete"),
            {"name": "Flask"},
            format="json",
        )

        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.data, {"task_id": "autocomplete-task-id"})
        task_data = mock_delay.call_args.args[0]
        self.assertEqual(task_data["admin_input_json"], {"name": "Flask"})
        self.assertEqual(task_data["uvl_model"], EXPECTED_MODEL_DICT)
        self.assertEqual(task_data["existing_languages_list"], ["Python", "JavaScript"])


class TaskStatusViewTests(APIClientMixin, BaseUVLTestCase):
    @patch("configurador.views.AsyncResult")
    def test_check_swot_status_returns_success_result(self, mock_async_result):
        mock_async_result.return_value = SimpleNamespace(
            state="SUCCESS",
            result={"strengths": ["Simple"]},
        )

        response = self.client.get(reverse("check_swot_status", args=["task-id"]))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {"status": "SUCCESS", "swot": {"strengths": ["Simple"]}},
        )
        mock_async_result.assert_called_once_with("task-id")

    @patch("configurador.views.AsyncResult")
    def test_check_swot_status_returns_failure_result(self, mock_async_result):
        mock_async_result.return_value = SimpleNamespace(state="FAILURE")

        response = self.client.get(reverse("check_swot_status", args=["task-id"]))

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.data["status"], "FAILURE")

    @patch("configurador.views.AsyncResult")
    def test_check_autocomplete_status_returns_pending_result(self, mock_async_result):
        mock_async_result.return_value = SimpleNamespace(state="PENDING")

        response = self.client.get(
            reverse("check_autocomplete_status", args=["task-id"])
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"status": "PENDING"})


class PDFExportViewTests(APIClientMixin, BaseUVLTestCase):
    def get_valid_swot_payload(self):
        return {
            "strengths": ["Fortaleza 1", "Fortaleza 2"],
            "opportunities": ["Oportunidad 1"],
            "weaknesses": ["Debilidad 1", "Debilidad 2", "Debilidad 3"],
            "threats": ["Amenaza 1"],
        }

    def test_export_swot_pdf_returns_pdf_response(
        self
    ):
        response = self.client.post(
            reverse("get_dafo_pdf"),
            self.get_valid_swot_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertEqual(
            response["Content-Disposition"],
            'attachment; filename="analisis_dafo_tfg.pdf"',
        )

    @patch("configurador.views.pisa.CreatePDF")
    def test_export_swot_pdf_returns_error_when_pdf_generation_fails(
        self,
        mock_create_pdf,
    ):
        mock_create_pdf.return_value = SimpleNamespace(err=True)

        response = self.client.post(
            reverse("get_dafo_pdf"),
            self.get_valid_swot_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 500)

    def test_export_swot_pdf_rejects_invalid_payload(self):
        response = self.client.post(
            reverse("get_dafo_pdf"),
            {"strengths": ["Simple"]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)
        self.assertTrue(
            any("weaknesses" in error for error in response.data["detail"])
        )


class ManageUVLModelViewTests(APIClientMixin, BaseTestCase):
    def setUp(self):
        super().setUp()
        self.admin_user = create_admin_user()

    def test_manage_uvl_get_returns_current_model_for_admin(self):
        self.authenticate_admin()

        response = self.client.get(reverse("manage_uvl"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, EXPECTED_MODEL_DICT)

    def test_manage_uvl_get_returns_draft_from_cache_for_admin(self):
        self.authenticate_admin()
        draft_uvl = 'features\n\t"Project"\n\t\tmandatory\n\t\t\t"Nuevo"'
        cache.set("admin_edit_session", {"uvl_content": draft_uvl})

        response = self.client.get(reverse("manage_uvl"))
        expected_draft_model = FlamapyService.create_str(draft_uvl).to_dict()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_draft_model)

    def test_manage_uvl_put_publishes_valid_model_for_admin(self):
        self.authenticate_admin()
        new_model=json.loads(json.dumps(EXPECTED_MODEL_DICT))
        backend_node=next((relation["children"][0] for relation in new_model["relations"] if any(child["name"]=="Backend" for child in relation["children"])))
        backend_node["relations"].append({"type":"OPTIONAL","children":[{"name":"New feature","relations":[],"attributes":{}}]})
        response = self.client.put(
            reverse("manage_uvl"),
            new_model,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(cache.get("admin_edit_session"))
        self.assertEqual(
            UVLModel.objects.first().raw_content,
            FlamapyService.get_uvl_text(new_model),
        )
    def test_manage_uvl_put_publishes_valid_model_edits_attributes(self):
        self.authenticate_admin()
        new_model=json.loads(json.dumps(EXPECTED_MODEL_DICT))
        backend_node=next((relation["children"][0] for relation in new_model["relations"] if any(child["name"]=="Backend" for child in relation["children"])))
        backend_node["attributes"]={"label":"label"}
        response = self.client.put(
            reverse("manage_uvl"),
            new_model,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(cache.get("admin_edit_session"))
        self.assertEqual(
            UVLModel.objects.first().raw_content,
            FlamapyService.get_uvl_text(new_model),
        )

    def test_manage_uvl_put_returns_feature_names_when_serializer_validation_fails(self):
        self.authenticate_admin()
        new_model = json.loads(json.dumps(EXPECTED_MODEL_DICT))
        backend_node = next(
            relation["children"][0]
            for relation in new_model["relations"]
            if any(child["name"] == "Backend" for child in relation["children"])
        )
        backend_node["attributes"] = {"": "label"}

        response = self.client.put(
            reverse("manage_uvl"),
            new_model,
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)
        self.assertTrue(
            any("Project" in error and "Backend" in error for error in response.data["detail"])
        )

    def test_manage_uvl_put_stores_session_when_projects_become_invalid(self):
        self.authenticate_admin()
        new_model=json.loads(json.dumps(EXPECTED_MODEL_DICT))
        backend_node=next((relation["children"][0] for relation in new_model["relations"] if any(child["name"]=="Backend" for child in relation["children"])))
        backend_node["relations"]=[]

        response = self.client.put(
            reverse("manage_uvl"),
            new_model,
            format="json",
        )

        self.assertEqual(response.status_code, 409)
        self.assertIn("invalid_projects", response.data)
        self.assertTrue(
            "Django" in {project["name"] for project in response.data["invalid_projects"]}
        )
        self.assertIsNotNone(cache.get("admin_edit_session"))

    def test_manage_uvl_delete_discards_draft_session_for_admin(self):
        self.authenticate_admin()
        cache.set("admin_edit_session", {"uvl_content": "draft"})

        response = self.client.delete(reverse("manage_uvl"))

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(cache.get("admin_edit_session"))


class InvalidProjectsViewTests(APIClientMixin, BaseUVLTestCase):
    def setUp(self):
        super().setUp()
        self.admin_user = create_admin_user()

    def test_get_invalid_projects_returns_error_without_session(self):
        self.authenticate_admin()

        response = self.client.get(reverse("invalid_projects"))

        self.assertEqual(response.status_code, 400)

    def test_get_invalid_projects_returns_session_projects(self):
        self.authenticate_admin()
        invalid_projects = [
            {
                "id": 1,
                "name": "Flask",
                "features": ["Project", "Backend"],
            }
        ]
        cache.set("admin_edit_session", {"invalid_projects": invalid_projects})

        response = self.client.get(reverse("invalid_projects"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, invalid_projects)


class DraftProjectViewTests(APIClientMixin, BaseTestCase):
    def setUp(self):
        super().setUp()
        self.admin_user = create_admin_user()
        self.flask = Project.objects.get(name="Flask")

    def set_draft_session(self):
        invalid_project = {
            "id": self.flask.id,
            "name": "Flask",
            "features": ["Project", "Backend"],
        }
        cache.set(
            "admin_edit_session",
            {
                "uvl_content": self.uvl_model_test.read_text(encoding="utf-8"),
                "invalid_projects": [invalid_project],
                "pending_fixes": {},
                "pending_remove": [],
            },
        )
        return invalid_project

    def test_draft_project_put_saves_valid_feature_fix(self):
        self.authenticate_admin()
        invalid_project = self.set_draft_session()
        valid_features = ["Project", "Backend", "ApiStyle", "Rest"]

        response = self.client.put(
            reverse("draft_project", args=[invalid_project["id"]]),
            {"features": valid_features},
            format="json",
        )

        session_data = cache.get("admin_edit_session")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            session_data["pending_fixes"],
            {str(invalid_project["id"]): valid_features},
        )
        self.assertEqual(session_data["invalid_projects"], [])

    def test_draft_project_put_rejects_invalid_feature_fix(self):
        self.authenticate_admin()
        invalid_project = self.set_draft_session()

        response = self.client.put(
            reverse("draft_project", args=[invalid_project["id"]]),
            {"features": ["Project", "Backend"]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_draft_project_delete_marks_invalid_project_for_removal(self):
        self.authenticate_admin()
        invalid_project = self.set_draft_session()

        response = self.client.delete(
            reverse("draft_project", args=[invalid_project["id"]])
        )

        session_data = cache.get("admin_edit_session")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(session_data["pending_remove"], [str(invalid_project["id"])])
        self.assertEqual(session_data["invalid_projects"], [])
