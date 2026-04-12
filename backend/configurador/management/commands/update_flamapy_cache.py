from django.core.management.base import BaseCommand
from django.core.cache import cache

class Command(BaseCommand):
    help = 'Actualiza la caché de Flamapy incrementando la versión para forzar la recarga del Singleton en los tests E2E.'

    def handle(self, *args, **kwargs):
        # Leemos la versión actual (o 1 por defecto)
        version = cache.get('uvl_model_version', 1)
        nueva_version = version + 1
        
        # Guardamos la nueva versión sin caducidad (timeout=None)
        cache.set('uvl_model_version', nueva_version, timeout=None)
        
        # Imprimimos en verde (SUCCESS) para que se vea bonito en la consola de Cypress
        self.stdout.write(
            self.style.SUCCESS(f'Caché invalidada con éxito. Singleton forzado a recargar. Nueva versión: {nueva_version}')
        )