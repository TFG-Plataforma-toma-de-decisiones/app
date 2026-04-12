from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
class Command(BaseCommand):
    help = "Resetea la base de datos y carga fixtures"

    def handle(self, *args, **kwargs):
        self.stdout.write("🔄 Reseteando base de datos...")

        call_command("flush", "--noinput")
        call_command("loaddata", "configurador/fixtures/datos.json")
        User=get_user_model()
        User.objects.create_superuser('admin', 'admin@admin.com', 'admin')
        self.stdout.write(self.style.SUCCESS("✅ Base de datos reseteada"))