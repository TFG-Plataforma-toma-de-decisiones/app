from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
def _handle_validation_error(exc, response):
    errores_formateados = []
    
    if isinstance(response.data, dict):
        for field, errors in response.data.items():
            if isinstance(errors, list):
                errores_formateados.append(f"{field}: {', '.join(errors)}")
            else:
                errores_formateados.append(f"{field}: {errors}")
    elif isinstance(response.data, list):
        errores_formateados = [str(e) for e in response.data]

    response.data = {
        "detail": errores_formateados 
    }
    return response


def _handle_generic_error(exc):
    """Captura cualquier error 500 no controlado por DRF."""
    return Response(
        {
            "detail": "Ha habido un error inesperado en la petición."
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def _handle_standard_drf_error(exc, response):
    """Formatea otros errores de DRF (401, 403, 404...) bajo la clave 'details'."""
    mensaje = response.data.get('detail', str(exc))
    response.data = {
        "details": str(mensaje)
    }
    return response
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        if settings.DEBUG:
            raise exc
        return _handle_generic_error(exc)
    if isinstance(exc, ValidationError):
        return _handle_validation_error(exc, response)
    return _handle_standard_drf_error(exc, response)