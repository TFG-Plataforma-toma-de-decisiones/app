from celery import shared_task
from configurador.langchain.langchainService import langchain_service

@shared_task
def generate_swot_task(data):
    swot = langchain_service.generate_swot_analysis(data)
    return swot
@shared_task
def autocomplete_project_task(data):
    project=langchain_service.autocomplete_project(data)
    return project