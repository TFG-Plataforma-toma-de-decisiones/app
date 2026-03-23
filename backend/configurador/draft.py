from django.core.cache import cache
from django.db import transaction
from configurador.flamapy.flamapyService import FlamapyService
from configurador.models import Language, Project


class DraftService:
    timeout = 86400
    editable_fields = ("name", "description", "language", "features")

    @classmethod
    def get_session_key(cls, user_id):
        return f'admin_edit_session:{user_id}'

    @classmethod
    def get_session(cls, user):
        return cache.get(cls.get_session_key(user.id))

    @classmethod
    def set_session(cls, user, session_data):
        cache.set(cls.get_session_key(user.id), session_data, cls.timeout)

    @classmethod
    def delete_session(cls, user):
        cache.delete(cls.get_session_key(user.id))

    @classmethod
    def get_project_data(cls, project, pending_updates=None, pending_deletions=None):
        pending_updates = pending_updates or {}
        pending_deletions = set(str(project_id) for project_id in (pending_deletions or []))
        data = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "language": project.language.name,
            "features": list(project.features),
            "is_pending_delete": str(project.id) in pending_deletions,
        }
        data.update(pending_updates.get(str(project.id), {}))
        data["features"] = list(data.get("features", []))
        data["is_pending_delete"] = str(project.id) in pending_deletions
        return data

    @classmethod
    def normalize_project_data(cls, project_data):
        return {
            "name": project_data["name"].strip(),
            "description": project_data["description"].strip(),
            "language": project_data["language"].strip(),
            "features": [feature.strip() for feature in project_data["features"]],
        }

    @classmethod
    def validate_project_data(cls, project_data):
        errors = {}
        for field in ("name", "description", "language"):
            value = project_data.get(field)
            if not isinstance(value, str) or not value.strip():
                errors[field] = f"{field} must be a non-empty string"
        features = project_data.get("features")
        if not isinstance(features, list):
            errors["features"] = "features must be a list"
        elif any(not isinstance(feature, str) or not feature.strip() for feature in features):
            errors["features"] = "features must contain non-empty strings"
        return errors

    @classmethod
    def get_project_patch(cls, project, project_data):
        patch = {}
        if project_data["name"] != project.name:
            patch["name"] = project_data["name"]
        if project_data["description"] != project.description:
            patch["description"] = project_data["description"]
        if project_data["language"] != project.language.name:
            patch["language"] = project_data["language"]
        if list(project_data["features"]) != list(project.features):
            patch["features"] = list(project_data["features"])
        return patch

    @classmethod
    def get_invalid_projects(cls, uvl_content, pending_updates=None, pending_deletions=None):
        draft_service = FlamapyService.create_str(uvl_content)
        invalid_projects = []
        for project in Project.objects.select_related("language").all().order_by("id"):
            project_data = cls.get_project_data(project, pending_updates, pending_deletions)
            if project_data["is_pending_delete"]:
                continue
            if not draft_service.validate(features=project_data["features"], is_full=True):
                invalid_projects.append(project_data)
        return invalid_projects

    @classmethod
    def build_session(cls, uvl_content, pending_updates=None, pending_deletions=None):
        pending_updates = {
            str(project_id): update
            for project_id, update in (pending_updates or {}).items()
            if update
        }
        pending_deletions = list(dict.fromkeys(str(project_id) for project_id in (pending_deletions or [])))
        return {
            "uvl_content": uvl_content,
            "pending_updates": pending_updates,
            "pending_deletions": pending_deletions,
            "invalid_projects": cls.get_invalid_projects(
                uvl_content,
                pending_updates,
                pending_deletions,
            ),
        }

    @classmethod
    def get_summary(cls, session_data):
        invalid_projects = session_data.get("invalid_projects", [])
        return {
            "has_draft": True,
            "invalid_projects": invalid_projects,
            "pending_deletions": [int(project_id) for project_id in session_data.get("pending_deletions", [])],
            "pending_updates": [int(project_id) for project_id in session_data.get("pending_updates", {}).keys()],
            "can_confirm": not invalid_projects,
        }

    @classmethod
    def apply_session(cls, session_data):
        pending_updates = session_data.get("pending_updates", {})
        pending_deletions = set(session_data.get("pending_deletions", []))
        with transaction.atomic():
            if pending_deletions:
                Project.objects.filter(id__in=[int(project_id) for project_id in pending_deletions]).delete()
            projects = Project.objects.select_related("language").filter(
                id__in=[int(project_id) for project_id in pending_updates.keys() if project_id not in pending_deletions]
            )
            for project in projects:
                patch = pending_updates.get(str(project.id), {})
                update_fields = []
                if "name" in patch:
                    project.name = patch["name"]
                    update_fields.append("name")
                if "description" in patch:
                    project.description = patch["description"]
                    update_fields.append("description")
                if "language" in patch:
                    language, _ = Language.objects.get_or_create(name=patch["language"])
                    project.language = language
                    update_fields.append("language")
                if "features" in patch:
                    project.features = patch["features"]
                    update_fields.append("features")
                if update_fields:
                    project.save(update_fields=update_fields)
            FlamapyService.publish_new_model(session_data["uvl_content"])
