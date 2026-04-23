from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
def _handle_validation_error(exc, response):
    errores_formateados = []
    
    if isinstance(response.data, dict):
        # Manejo para un solo objeto (sin many=True)
        for field, errors in response.data.items():
            if isinstance(errors, list):
                # Usamos str(e) por si acaso viene un ErrorDetail dentro
                errores_formateados.append(f"{field}: {', '.join([str(e) for e in errors])}")
            else:
                errores_formateados.append(f"{field}: {str(errors)}")
                
    elif isinstance(response.data, list):
        for index, item_errors in enumerate(response.data):
            if isinstance(item_errors, dict) and item_errors: 
                for field, errors in item_errors.items():
                    if isinstance(errors, list):
                        mensajes = ', '.join([str(e) for e in errors])
                    else:
                        mensajes = str(errors)
                    errores_formateados.append(f"Element {index + 1} ({field}): {mensajes}")
            elif isinstance(item_errors, list):
                errores_formateados.append(f"Element {index + 1}: {', '.join([str(e) for e in item_errors])}")
            elif isinstance(item_errors, str):
                errores_formateados.append(item_errors)

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