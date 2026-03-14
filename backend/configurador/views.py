from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from configurador.flamapy.flamapyService import FlamapyService
from rest_framework.views import APIView
from configurador.models import Project,Language
from configurador.serializers import ProjectSerializer,LanguageSerializer
from django.shortcuts import get_object_or_404
from configurador.utils import features_set_by_name
from rest_framework import viewsets,mixins
from rest_framework.permissions import IsAdminUser, AllowAny
@api_view(['GET'])
def get_uvl_model(request):
    flamapy_service=FlamapyService.get_instance()
    return JsonResponse(flamapy_service.to_dict(),safe=False)
@api_view(['GET'])
def get_projects(request):
    projets=Project.objects.all()
    serializer=ProjectSerializer(projets,many=True)
    return Response(serializer.data)
class ProjectView(APIView):
    def get(self, request, id):
        project = get_object_or_404(Project, pk=id)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)
class LanguageViewSet(mixins.ListModelMixin,   
                      mixins.CreateModelMixin, 
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
@api_view(['POST'])
def get_recommendation(request):
    
    projects = list(Project.objects.all())
    libraries_by_type = {
        "Frontend": [p for p in projects if p.type == "Frontend Library"],
        "Backend": [p for p in projects if p.type == "Backend Library"],
        "Full Stack": [p for p in projects if p.type in ["Backend Library","Frontend Library"]],
    }
    result = []
    count_per_type = {"Frontend":0, "Backend":0, "Full Stack":0}
    for project_request in request.data:
        requested_features = features_set_by_name(project_request["features"])
        projects_filter = (
            (lambda p: p.type == project_request["type"] and project_request.get("language") == p.language.name)
            if (project_request.get("language") or "").strip()
            else (lambda p: p.type == project_request["type"])
        )   

        for project in filter(projects_filter, projects):
            covered_features = features_set_by_name(project.features)
            libraries_used = []

            while (missing := requested_features - covered_features):
                library = next(
                    filter(
                        lambda p: features_set_by_name(p.features) & missing and p.language==project.language,
                        libraries_by_type[project.type]
                    ),
                    None
                )
                if not library:
                    break
                covered_features |= features_set_by_name(library.features)
                libraries_used.append(library.name)
            if count_per_type[project.type] < 5 and not missing:
                result.append({
                    "type": project.type,
                    "project": project.name,
                    "libraries": libraries_used
                })
                count_per_type[project.type] += 1
            if count_per_type[project.type] >= 5:
                break
    return Response(result)
            
        
        

