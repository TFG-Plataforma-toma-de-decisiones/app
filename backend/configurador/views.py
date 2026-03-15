from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from configurador.flamapy.flamapyService import FlamapyService
from configurador.models import Project,Language
from configurador.serializers import ProjectSerializer,LanguageSerializer,UserSerializer
from configurador.utils import features_set_by_name
from rest_framework import viewsets,mixins
from rest_framework.permissions import BasePermission,SAFE_METHODS
from configurador.langchain.langchainService import langchain_service
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
    data={
        "admin_input_json":request.data,
        "uvl_model":uvl_model
    }
    project_data=langchain_service.autocomplete_project(data)
    return Response(data=project_data)
        

