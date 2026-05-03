from django.http import JsonResponse,HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from configurador.flamapy.flamapyService import FlamapyService
from configurador.models import Project,Language
from configurador.serializers import ConfiguratorBranchSerializer, ProjectSerializer,LanguageSerializer,SWOTPdfExportSerializer,UserSerializer,UVLModelSerializer
from configurador.utils import features_set_by_name,aplanar_errores_uvl
from rest_framework import viewsets,mixins
from rest_framework.permissions import BasePermission,SAFE_METHODS,IsAdminUser
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
@api_view(['GET'])
def projects_name(request):
    projects = list(
    Project.objects.filter(
        features__overlap=["Backend", "Frontend", "Full Stack"]
    ).values_list("name", flat=True)
)
    return Response(projects)
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
    serializer=ConfiguratorBranchSerializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)
    projects = list(Project.objects.all().prefetch_related("compatible_projects"))
    libraries_by_type = {
        "Frontend": [p for p in projects if "Frontend Library" in p.features],
        "Backend": [p for p in projects if "Backend Library" in p.features],
        "Full Stack": [p for p in projects if any(typeProject in p.features for typeProject in ["Backend Library","Frontend Library"])],
    }
    result = []
    for project_request in request.data:
        typeProject=project_request["type"]
        requested_features = features_set_by_name(project_request["features"])
        projects_filter = (
            lambda p: typeProject in p.features and (p.language.name in project_request.get("languages") or len(project_request.get("languages"))==0)
        )   

        for project in filter(projects_filter, projects):
            covered_features = features_set_by_name(project.features)
            libraries_used = []

            while (missing := requested_features - covered_features):
                candidates = [
                                (
                                    p,
                                    {cp.pk for cp in p.compatible_projects.all()},
                                    features_set_by_name(p.features) & missing,
                                )
                                for p in libraries_by_type[typeProject]
                                if p.language_id == project.language_id
                            ]
                library = next(
                                (
                                    p for p, compatible_ids, covered in sorted(
                                        (
                                            (p, compatible_ids, covered)
                                            for p, compatible_ids, covered in candidates
                                            if covered and (project.pk in compatible_ids or not compatible_ids)
                                        ),
                                        key=lambda item: (
                                            project.pk in item[1],
                                            len(item[2]),
                                        ),
                                        reverse=True,
                                    )
                                ),
                                None,
                            )
                if not library:
                    break
                covered_features |= features_set_by_name(library.features)
                libraries_used.append(library.name)
            if not missing:
                result.append({
                    "type": typeProject,
                    "project": project.name,
                    "libraries": libraries_used
                })
    return Response(list(sorted(result,key=lambda p:len(p["libraries"]))))
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
    serializer = SWOTPdfExportSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

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
    projects = list(
    Project.objects.filter(
        features__overlap=["Backend", "Frontend", "Full Stack"]
    ).values_list("name", flat=True)
    )
    data={
        "admin_input_json":request.data,
        "uvl_model":uvl_model,
        "existing_languages_list":languages,
        "projects":projects
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
            serializer=UVLModelSerializer(data=request.data)
            if not serializer.is_valid():
                nombre_raiz = request.data.get("name") if isinstance(request.data, dict) else None
                root_path = f"[{nombre_raiz}]" if nombre_raiz else "[Raíz]"
                errores_formateados = aplanar_errores_uvl(
                    errores_drf=serializer.errors, 
                    datos_originales=request.data, 
                    path_actual=root_path
                )
                return Response(
                    {"detail": errores_formateados}, 
                    status=400
                )
            uvl_content = FlamapyService.get_uvl_text(serializer.validated_data)
        elif 'uvl_content' in session_data:
            uvl_content=session_data['uvl_content']
        else:
            return Response(data={"detail":"No hay borrador existente."},status=400)
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
    def delete(self,request):
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
