from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from configurador.flamapy.flamapyService import FlamapyService
from rest_framework.views import APIView
from configurador.models import Project
from configurador.serializers import ProjectSerializer
from django.shortcuts import get_object_or_404
# Create your views here.
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