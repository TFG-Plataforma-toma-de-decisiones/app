import os
from django.conf import settings
from langchain_core.prompts import ChatPromptTemplate

RUTA_PROMPT_SWOT = os.path.join(settings.BASE_DIR, 'configurador', 'prompt_dafo.txt')
RUTA_PROMPT_AUTOCOMPLETE= os.path.join(settings.BASE_DIR, 'configurador', 'prompt_autocompletado.txt')
with open(RUTA_PROMPT_SWOT, 'r', encoding='utf-8') as f:
    TEXTO_PROMPT_SWOT = f.read()
PROMPT_SWOT = ChatPromptTemplate.from_template(TEXTO_PROMPT_SWOT)


with open(RUTA_PROMPT_AUTOCOMPLETE, 'r', encoding='utf-8') as f:
    TEXTO_PROMPT_AUTOCOMPLETE = f.read()
PROMPT_AUTOCOMPLETE = ChatPromptTemplate.from_template(TEXTO_PROMPT_AUTOCOMPLETE)