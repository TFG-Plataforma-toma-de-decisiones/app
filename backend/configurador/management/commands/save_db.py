import os
from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    # Esta es la descripción que aparecerá si ejecutas: python manage.py help save_db
    help = 'Guarda el estado de los modelos Project y Language en un fixture JSON.'

    def handle(self, *args, **kwargs):
        # 1. Configurar la ruta y el nombre del archivo
        app_name = 'configurador'  # <-- ¡Recuerda cambiar esto por el nombre de tu app!
        output_dir = 'configurador/fixtures'
        output_file = os.path.join(output_dir, 'datos.json')

        self.stdout.write(self.style.WARNING('Generando fixture de Project y Language...'))

        try:
            # 3. Abrir el archivo y ejecutar el comando dumpdata directamente hacia él
            with open(output_file, 'w', encoding='utf-8') as f:
                call_command(
                    'dumpdata',
                    f'{app_name}.Project',
                    f'{app_name}.Language',
                    indent=4,
                    stdout=f  # Redirige la salida estándar al archivo
                )
            
            # 4. Mensaje de éxito en verde
            self.stdout.write(self.style.SUCCESS(f'¡Éxito! Base de datos guardada en {output_file}'))
            
        except Exception as e:
            # Mensaje de error en rojo
            self.stdout.write(self.style.ERROR(f'Ocurrió un error al guardar: {str(e)}'))