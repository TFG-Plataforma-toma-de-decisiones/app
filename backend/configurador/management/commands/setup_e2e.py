# backend/configurador/management/commands/setup_e2e_env.py

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import get_user_model
import shutil

class Command(BaseCommand):
    help = 'Prepara el entorno para tests E2E: Borra DB, carga Fixture, restaura UVL e invalida la caché.'

    def handle(self, *args, **kwargs):
        self.stdout.write("--- Iniciando Reset del Entorno E2E ---")

        # 1. Vaciar la base de datos
        self.stdout.write("1. Vaciando la base de datos...")
        call_command('flush', interactive=False)

        # 2. Cargar el fixture
        self.stdout.write("2. Cargando fixture de datos...")
        call_command('loaddata', 'configurador/test/test_data/test_fixture.json')

        # 3. Crear el superusuario directamente con el ORM (Ultrarrápido y sin errores de inputs)
        self.stdout.write("3. Creando usuario admin...")
        User = get_user_model()
        User.objects.create_superuser('admin', 'admin@admin.com', 'admin')

        # 4. Actualizar la caché de Redis
        self.stdout.write("4. Actualizando caché de Flamapy...")
        version = cache.get('uvl_model_version', 1)
        nueva_version = version + 1
        cache.set('uvl_model_version', nueva_version, timeout=None)

        # 5. Restaurar el archivo UVL (Asumiendo que BASE_DIR es la carpeta 'backend')
        self.stdout.write("5. Restaurando archivo UVL...")
        backup_path = settings.BASE_DIR / "configurador/test/test_data/test_model_backup.uvl"
        target_path = settings.BASE_DIR / "configurador/test/test_data/test_model.uvl"
        shutil.copy(backup_path, target_path)

        # Confirmación final
        self.stdout.write(self.style.SUCCESS(
            f'¡Entorno E2E listo! BD restaurada, Admin creado, Archivo copiado y Caché en v{nueva_version}'
        ))