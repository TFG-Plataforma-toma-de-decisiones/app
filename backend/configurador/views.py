from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from configurador.flamapy.flamapyService import FlamapyService
# Create your views here.
@api_view(['GET'])
def get_uvl_model(request):
    flamapy_service=FlamapyService.get_instance()
    return JsonResponse(flamapy_service.to_dict(),safe=False)