from django.core.cache import cache
from django.db import transaction
from configurador.flamapy.flamapyService import FlamapyService
from configurador.models import Project


class DraftService:
    timeout = 86400

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
    def get_pending_features(cls, session_data):
        return (session_data or {}).get("pending_features", (session_data or {}).get("pending_updates", {}))

    @classmethod
    def get_project_data(cls, project, pending_features=None, pending_deletions=None):
        pending_features = pending_features or {}
        pending_deletions = set(str(project_id) for project_id in (pending_deletions or []))
        data = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "language": project.language.name,
            "features": list(pending_features.get(str(project.id), project.features)),
            "is_pending_delete": str(project.id) in pending_deletions,
        }
        return data

    @classmethod
    def normalize_features(cls, features):
        return [feature.strip() for feature in features]

    @classmethod
    def validate_features(cls, features):
        if not isinstance(features, list):
            return {"features": "features must be a list"}
        if any(not isinstance(feature, str) or not feature.strip() for feature in features):
            return {"features": "features must contain non-empty strings"}
        return {}

    @classmethod
    def get_features_patch(cls, project, features):
        features = cls.normalize_features(features)
        if list(project.features) == features:
            return None
        return features

    @classmethod
    def get_invalid_projects(cls, uvl_content, pending_features=None, pending_deletions=None):
        draft_service = FlamapyService.create_str(uvl_content)
        invalid_projects = []
        for project in Project.objects.select_related("language").all().order_by("id"):
            project_data = cls.get_project_data(project, pending_features, pending_deletions)
            if project_data["is_pending_delete"]:
                continue
            if not draft_service.validate(features=project_data["features"], is_full=True):
                invalid_projects.append(project_data)
        return invalid_projects

    @classmethod
    def build_session(cls, uvl_content, pending_features=None, pending_deletions=None):
        pending_features = {
            str(project_id): cls.normalize_features(features)
            for project_id, features in (pending_features or {}).items()
            if features is not None
        }
        pending_deletions = list(dict.fromkeys(str(project_id) for project_id in (pending_deletions or [])))
        return {
            "uvl_content": uvl_content,
            "pending_features": pending_features,
            "pending_deletions": pending_deletions,
            "invalid_projects": cls.get_invalid_projects(
                uvl_content,
                pending_features,
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
            "pending_updates": [int(project_id) for project_id in cls.get_pending_features(session_data).keys()],
            "can_confirm": not invalid_projects,
        }

    @classmethod
    def apply_session(cls, session_data):
        pending_features = cls.get_pending_features(session_data)
        pending_deletions = set(session_data.get("pending_deletions", []))
        with transaction.atomic():
            if pending_deletions:
                Project.objects.filter(id__in=[int(project_id) for project_id in pending_deletions]).delete()
            projects = list(Project.objects.filter(
                id__in=[int(project_id) for project_id in pending_features.keys() if project_id not in pending_deletions]
            ))
            for project in projects:
                project.features = pending_features[str(project.id)]
            if projects:
                Project.objects.bulk_update(projects, ["features"])
            FlamapyService.publish_new_model(session_data["uvl_content"])
