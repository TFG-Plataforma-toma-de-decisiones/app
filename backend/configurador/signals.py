from django.db.models.signals import pre_delete, post_delete
from django.dispatch import receiver

from .models import Project


@receiver(pre_delete, sender=Project)
def cache_dependent_projects_before_delete(sender, instance, **kwargs):
    """
    Guarda los IDs de los proyectos que dependen explícitamente del proyecto
    que se va a borrar.
    """
    instance._dependent_project_ids = list(
        instance.compatible_libraries.values_list("id", flat=True)
    )


@receiver(post_delete, sender=Project)
def delete_orphan_dependent_projects(sender, instance, **kwargs):
    """
    Después de borrar un proyecto, elimina también los proyectos que se queden
    sin ningún compatible_project explícito.
    """
    dependent_ids = getattr(instance, "_dependent_project_ids", [])

    for project in Project.objects.filter(id__in=dependent_ids):
        if not project.compatible_projects.exists():
            project.delete()