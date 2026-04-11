from django.http import JsonResponse,HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from configurador.flamapy.flamapyService import FlamapyService
from configurador.models import Project,Language
from configurador.serializers import ProjectSerializer,LanguageSerializer,UserSerializer
from configurador.utils import features_set_by_name
from rest_framework import viewsets,mixins
from rest_framework.permissions import BasePermission,SAFE_METHODS,IsAdminUser
from configurador.langchain.langchainService import langchain_service
from rest_framework.views import APIView
from django.db import transaction
from django.core.cache import cache
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from celery.result import AsyncResult
from .tasks import generate_swot_task,autocomplete_project_task
class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
@api_view(['GET'])
def get_uvl_model(request):
    flamapy_service=FlamapyService.get_instance()
    return Response(flamapy_service.to_dict())
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
    recommendations=request.data["recommendations"]
    projects = [
    item 
    for rec in recommendations 
    for item in ([rec["project"]] + rec["libraries"])
    ]
    projects_data=list(Project.objects.filter(name__in=projects).values("name","features"))
    data={
        "user_features":request.data["preferences"],
        "user_comments":request.data["comments"],
        "selected_projects_list":recommendations,
        "project_features_details":projects_data,
        "uvl_model":uvl_model
    }
    task = generate_swot_task.delay(data)
    
    # Devolvemos el ticket al usuario
    return Response({"task_id": task.id}, status=202)
@api_view(["GET"])
def check_swot_status(request, task_id):
    task_result = AsyncResult(task_id)
    if task_result.state == 'SUCCESS':
        return Response({"status": "SUCCESS", "swot": task_result.result})
    elif task_result.state == 'FAILURE':
        return Response({"status": "FAILURE", "error": "Falló la IA"}, status=500)
    else:
        return Response({"status": "PENDING"})



@api_view(['POST'])
def export_swot_pdf(request):
    
    data = request.data

    html_string = render_to_string('swot_pdf.html', {'dafo': data})

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="analisis_dafo_tfg.pdf"'

    pisa_status = pisa.CreatePDF(html_string, dest=response)
    
    if pisa_status.err:
        return Response(
            {'detail': 'Hubo un error al generar el PDF de tu DAFO'}, 
            status=500
        )
        
    return response
@api_view(["POST"])
def autocomplete(request):
    uvl_model=FlamapyService.get_instance().to_dict()
    languages=list(Language.objects.all().values_list("name",flat=True))
    data={
        "admin_input_json":request.data,
        "uvl_model":uvl_model,
        "existing_languages_list":languages
    }
    task = autocomplete_project_task.delay(data)
    return Response({"task_id": task.id}, status=202)
@api_view(["GET"])
def check_autocomplete_status(request, task_id):
    task_result = AsyncResult(task_id)
    if task_result.state == 'SUCCESS':
        return Response({"status": "SUCCESS", "project": task_result.result})
    elif task_result.state == 'FAILURE':
        return Response({"status": "FAILURE", "error": "Falló la IA"}, status=500)
    else:
        return Response({"status": "PENDING"})
class ManageUVLModelView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        session_data = cache.get('admin_edit_session')
        if session_data is not None:
            draft_service = FlamapyService.create_str(session_data["uvl_content"])
            return Response(data=draft_service.to_dict())
        else:
            service = FlamapyService.get_instance()
            return Response(service.to_dict())
                
    def put(self, request):
        session_data = cache.get('admin_edit_session', {}) 
        if request.data:
            uvl_content = FlamapyService.get_uvl_text(request.data)
        else:
            uvl_content=session_data['uvl_content']
        pending_fixes = session_data.get('pending_fixes', {})
        pending_remove = session_data.get('pending_remove', [])
        draft_service = FlamapyService.create_str(uvl_content)
        all_projects = Project.objects.all()
        invalid_projects = []
        for project in all_projects:
            if str(project.id) in pending_remove:
                continue
            features_to_test = pending_fixes.get(str(project.id), project.features)
            is_valid = draft_service.validate(features=features_to_test, is_full=True)
            if not is_valid:
                invalid_projects.append({
                    "id": project.id,
                    "name": project.name,
                    "features": features_to_test
                })        
        if not invalid_projects:
            projects_to_update = []
            with transaction.atomic():
                for project in all_projects:
                    if str(project.id) in pending_fixes:
                        project.features = pending_fixes[str(project.id)]
                        projects_to_update.append(project)
                if projects_to_update:
                    Project.objects.bulk_update(projects_to_update, ['features'])
                if pending_remove:
                    Project.objects.filter(id__in=pending_remove).delete()
            FlamapyService.publish_new_model(uvl_content)
                
            cache.delete('admin_edit_session')
            return Response(data={"message": "Model updated successfully"}, status=200)
        else:
            new_session = {
                "uvl_content": uvl_content,
                "invalid_projects": invalid_projects,
                "pending_fixes": pending_fixes,
                "pending_remove": pending_remove
            }
            cache.set('admin_edit_session', new_session, 86400)
            return Response(data={
                "detail": "Hay projectos inválidos según el modelo.",
                "invalid_projects": invalid_projects
            }, status=409)
    def delete(self, request):
        cache.delete('admin_edit_session')
        return Response(data={"message": "Borrador descartado satisfactoriamente"}, status=200)
class DraftProject(APIView):
    permission_classes = [IsAdminUser]
    def put(self, request, id): 
        session_data = cache.get('admin_edit_session') 
        if not session_data:
            return Response(data={"detail": "No se ha encontrado sesión activa de edición"}, status=400)
        pending_fixes = session_data.get('pending_fixes', {})
        invalid_projects = session_data.get('invalid_projects', [])
        project=next(filter(lambda p:p["id"] == id,invalid_projects),None)
        if not project:
            return Response(data={"detail": "El projecto no está marcado como inválido."}, status=400)
        draft_service = FlamapyService.create_str(session_data.get('uvl_content'))
        features = request.data.get("features", [])
        if not draft_service.validate(features, True):
            return Response(data={"detail": "Características inválidas según el borrador actual."}, status=400)
        pending_fixes[str(id)] = features
        session_data['pending_fixes'] = pending_fixes
        invalid_projects.remove(project)
        session_data['invalid_projects']=invalid_projects
        cache.set('admin_edit_session', session_data, 86400)
        return Response(data={"message": "Arreglo guardado en el borrador."}, status=200)
    def delete(self, request, id):
        session_data = cache.get('admin_edit_session') 
        if not session_data:
            return Response(data={"detail": "No se ha encontrado sesión de edición."}, status=400)
        invalid_projects = session_data.get('invalid_projects', [])
        project=next(filter(lambda p:p["id"] == id,invalid_projects),None)
        if not project:
            return Response(data={"detail": "El proyecto no está marcado como inválido."}, status=400)
        pending_remove = session_data.get('pending_remove', [])
        if str(id) not in pending_remove:
            pending_remove.append(str(id))
        session_data['pending_remove'] = pending_remove
        invalid_projects.remove(project)
        session_data['invalid_projects']=invalid_projects
        cache.set('admin_edit_session', session_data, 86400)
        return Response(data={"message": "Proyecto marcado para borrado."}, status=200)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_invalid_projects(request):
    session_data = cache.get('admin_edit_session')
    if not session_data:
        return Response(data={"detail": "No se ha encontrado sesión activa de edición."}, status=400)
    invalid_projects = session_data.get('invalid_projects', [])
    return Response(data=invalid_projects)