from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from configurador.draft import DraftService
from configurador.flamapy.flamapyService import FlamapyService
from configurador.langchain.langchainService import langchain_service
from configurador.models import Project, Language
from configurador.serializers import ProjectSerializer, LanguageSerializer, UserSerializer
from configurador.utils import features_set_by_name
from rest_framework import mixins, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


@api_view(['GET'])
def get_uvl_model(request):
    flamapy_service=FlamapyService.get_instance()
    return JsonResponse(flamapy_service.to_dict(),safe=False)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]

class LanguageViewSet(mixins.ListModelMixin,   
                      mixins.CreateModelMixin, 
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes=[IsAdminOrReadOnly]
@api_view(['GET'])
def get_my_user(request):
    return Response(UserSerializer(request.user).data)
@api_view(['POST'])
def get_recommendation(request):
    projects = list(Project.objects.all())
    libraries_by_type = {
        "Frontend": [p for p in projects if "Frontend Library" in p.features],
        "Backend": [p for p in projects if "Backend Library" in p.features],
        "Full Stack": [p for p in projects if any(typeProject in p.features for typeProject in ["Backend Library","Frontend Library"])],
    }
    result = []
    count_per_type = {"Frontend":0, "Backend":0, "Full Stack":0}
    for project_request in request.data:
        typeProject=project_request["type"]
        requested_features = features_set_by_name(project_request["features"])
        projects_filter = (
            (lambda p: typeProject in p.features and project_request.get("language") == p.language.name)
            if (project_request.get("language") or "").strip()
            else (lambda p: project_request["type"] in p.features)
        )   

        for project in filter(projects_filter, projects):
            covered_features = features_set_by_name(project.features)
            libraries_used = []

            while (missing := requested_features - covered_features):
                library = next(
                    filter(
                        lambda p: features_set_by_name(p.features) & missing and p.language==project.language,
                        libraries_by_type[typeProject]
                    ),
                    None
                )
                if not library:
                    break
                covered_features |= features_set_by_name(library.features)
                libraries_used.append(library.name)
            if count_per_type[typeProject] < 5 and not missing:
                result.append({
                    "type": typeProject,
                    "project": project.name,
                    "libraries": libraries_used
                })
                count_per_type[typeProject] += 1
            if count_per_type[typeProject] >= 5:
                break
    return Response(result)
@api_view(["POST"])
def get_swot(request):
    uvl_model=FlamapyService.get_instance().to_dict()
    main_project=request.data["recommendation"]
    projects=[main_project["project"]]+main_project["libraries"]
    projects_data=Project.objects.filter(name__in=projects).values("name","features")
    data={
        "user_features":request.data["preferences"],
        "user_comments":request.data["comments"],
        "framework_name":main_project["project"],
        "libraries_list":main_project["libraries"],
        "project_features_details":projects_data,
        "uvl_model":uvl_model,
        "framework_role":main_project["type"]
    }
    print(data)
    swot=langchain_service.generate_swot_analysis(data)
    return Response(data=swot)
@api_view(["POST"])
def autocomplete(request):
    uvl_model=FlamapyService.get_instance().to_dict()
    languages=Language.objects.all().values_list("name",flat=True)
    data={
        "admin_input_json":request.data,
        "uvl_model":uvl_model,
        "existing_languages_list":languages
    }
    project_data=langchain_service.autocomplete_project(data)
    return Response(data=project_data)

class ManageUVLModelView(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request):
        session_data=DraftService.get_session(request.user)
        if session_data is not None:
            try:
                return Response(data=FlamapyService.create_str(session_data["uvl_content"]).to_dict())
            except Exception:
                return Response(data={"detail":"Draft UVL is corrupted"},status=500)
        return Response(FlamapyService.get_instance().to_dict())
    def put(self, request):
        payload=request.data.get("model",request.data)
        existing_session=DraftService.get_session(request.user)
        try:
            uvl_content=FlamapyService.get_uvl_text(payload)
            next_session=DraftService.build_session(
                uvl_content,
                pending_updates=(existing_session or {}).get("pending_updates", {}),
                pending_deletions=(existing_session or {}).get("pending_deletions", []),
            )
        except Exception:
            return Response(data={"detail":"Invalid UVL model"},status=400)
        if existing_session is None and not next_session["invalid_projects"] and not next_session["pending_updates"] and not next_session["pending_deletions"]:
            DraftService.apply_session(next_session)
            DraftService.delete_session(request.user)
            return Response(data={"message":"Model updated successfully","invalid_projects":[],"can_confirm":True},status=200)
        DraftService.set_session(request.user,next_session)
        has_conflicts=bool(next_session["invalid_projects"])
        return Response(
            data={
                "message":"Draft UVL saved. Resolve invalid projects before confirming." if has_conflicts else "Draft UVL saved. You can confirm the changes.",
                "invalid_projects":next_session["invalid_projects"],
                "can_confirm":not has_conflicts,
            },
            status=409 if has_conflicts else 200
        )
    def post(self, request):
        session_data=DraftService.get_session(request.user)
        if not session_data:
            return Response(data={"detail":"No active draft session found"},status=400)
        try:
            refreshed_session=DraftService.build_session(
                session_data["uvl_content"],
                pending_updates=session_data.get("pending_updates", {}),
                pending_deletions=session_data.get("pending_deletions", []),
            )
        except Exception:
            return Response(data={"detail":"Draft UVL is corrupted"},status=500)
        if refreshed_session["invalid_projects"]:
            DraftService.set_session(request.user,refreshed_session)
            return Response(
                data={"detail":"There are still invalid projects in the draft.","invalid_projects":refreshed_session["invalid_projects"],"can_confirm":False},
                status=409
            )
        DraftService.apply_session(refreshed_session)
        DraftService.delete_session(request.user)
        return Response(data={"message":"Draft confirmed successfully"},status=200)
    def delete(self, request):
        DraftService.delete_session(request.user)
        return Response(data={"message":"Draft discarded successfully"},status=200)


class DraftProjectView(APIView):
    permission_classes=[IsAdminUser]
    def put(self, request, id):
        session_data=DraftService.get_session(request.user)
        if not session_data:
            return Response(data={"detail":"No active draft session found"},status=400)
        project=get_object_or_404(Project.objects.select_related("language"),id=id)
        pending_updates=dict(session_data.get("pending_updates", {}))
        pending_deletions=set(session_data.get("pending_deletions", []))
        current_state=DraftService.get_project_data(project,pending_updates,pending_deletions)
        next_state={field: request.data.get(field,current_state[field]) for field in DraftService.editable_fields}
        validation_errors=DraftService.validate_project_data(next_state)
        if validation_errors:
            return Response(data={"detail":"Invalid project payload","errors":validation_errors},status=400)
        pending_patch=DraftService.get_project_patch(project,DraftService.normalize_project_data(next_state))
        if pending_patch:
            pending_updates[str(id)]=pending_patch
        else:
            pending_updates.pop(str(id),None)
        pending_deletions.discard(str(id))
        try:
            next_session=DraftService.build_session(
                session_data["uvl_content"],
                pending_updates=pending_updates,
                pending_deletions=list(pending_deletions),
            )
        except Exception:
            return Response(data={"detail":"Draft UVL is corrupted"},status=500)
        DraftService.set_session(request.user,next_session)
        return Response(
            data={
                "message":"Draft project updated successfully",
                "project":DraftService.get_project_data(project,next_session["pending_updates"],next_session["pending_deletions"]),
                "invalid_projects":next_session["invalid_projects"],
                "can_confirm":not next_session["invalid_projects"],
            },
            status=200
        )
    def delete(self, request, id):
        session_data=DraftService.get_session(request.user)
        if not session_data:
            return Response(data={"detail":"No active draft session found"},status=400)
        get_object_or_404(Project,id=id)
        pending_updates=dict(session_data.get("pending_updates", {}))
        pending_updates.pop(str(id),None)
        pending_deletions=set(session_data.get("pending_deletions", []))
        pending_deletions.add(str(id))
        try:
            next_session=DraftService.build_session(
                session_data["uvl_content"],
                pending_updates=pending_updates,
                pending_deletions=list(pending_deletions),
            )
        except Exception:
            return Response(data={"detail":"Draft UVL is corrupted"},status=500)
        DraftService.set_session(request.user,next_session)
        return Response(
            data={"message":"Project marked for deletion in draft","project_id":id,"invalid_projects":next_session["invalid_projects"],"can_confirm":not next_session["invalid_projects"]},
            status=200
        )
@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_draft_projects(request):
    session_data=DraftService.get_session(request.user)
    if not session_data:
        return Response(data={"has_draft":False,"invalid_projects":[],"pending_deletions":[],"pending_updates":[],"can_confirm":False},status=200)
    return Response(data=DraftService.get_summary(session_data),status=200)


    
