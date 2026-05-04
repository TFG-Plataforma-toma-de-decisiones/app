import os
from django.core.management.base import BaseCommand
from django.core.management import call_command
from configurador.models import UVLModel
class Command(BaseCommand):
    # Esta es la descripción que aparecerá si ejecutas: python manage.py help save_db
    help = 'Guarda el modelo UVL.'

    def handle(self, *args, **kwargs):
        # 1. Configurar la ruta y el nombre del archivo
        output_file = 'configurador/fixtures/model.uvl'

        self.stdout.write(self.style.WARNING('Generando fixture de Project y Language...'))
        uvl_model=UVLModel.objects.first()
        if uvl_model:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(uvl_model.raw_content)
            self.stdout.write(self.style.SUCCESS(f'¡Éxito! Modelo UVL guardado en {output_file}'))
        else:
            self.stdout.write(self.style.ERROR('No se ha encontrado ningún modelo en la base de datos'))