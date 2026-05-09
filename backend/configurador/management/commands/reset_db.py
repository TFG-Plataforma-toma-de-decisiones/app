from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from configurador.models import UVLModel
import os
from django.core.cache import cache
class Command(BaseCommand):
    help = "Resetea la base de datos y carga fixtures"

    def handle(self, *args, **kwargs):
        self.stdout.write("🔄 Reseteando base de datos...")

        call_command("flush", "--noinput")
        call_command("loaddata", "configurador/fixtures/datos.json")
        call_command("createsuperuser","--noinput")
        uvl_file_path = os.path.join(settings.BASE_DIR, "configurador", "fixtures", "model.uvl")
        try:
            with open(uvl_file_path, 'r', encoding='utf-8') as file:
                uvl_content = file.read()
            UVLModel.objects.update_or_create(
            defaults={'raw_content': uvl_content}
        )
            self.stdout.write(self.style.SUCCESS(f"✅ Modelo UVL cargado exitosamente desde {uvl_file_path}"))
            
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"❌ Error: No se encontró el archivo UVL en {uvl_file_path}"))
            return
        self.stdout.write("5. Actualizando caché de Flamapy...")
        version = cache.get('uvl_model_version', 1)
        nueva_version = version + 1
        cache.set('uvl_model_version', nueva_version, timeout=None)
        cache.delete('admin_edit_session')
        self.stdout.write(self.style.SUCCESS("✅ Base de datos reseteada"))