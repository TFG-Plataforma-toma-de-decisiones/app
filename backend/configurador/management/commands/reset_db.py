from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.conf import settings
from configurador.models import UVLModel
import os
class Command(BaseCommand):
    help = "Resetea la base de datos y carga fixtures"

    def handle(self, *args, **kwargs):
        self.stdout.write("🔄 Reseteando base de datos...")

        call_command("flush", "--noinput")
        call_command("loaddata", "configurador/fixtures/datos.json")
        User=get_user_model()
        User.objects.create_superuser('admin', 'admin@admin.com', 'admin')
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
        self.stdout.write(self.style.SUCCESS("✅ Base de datos reseteada"))