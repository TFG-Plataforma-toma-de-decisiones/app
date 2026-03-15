# tu_app/prompts.py
import os
from django.conf import settings
from langchain_core.prompts import ChatPromptTemplate

RUTA_PROMPT = os.path.join(settings.BASE_DIR, 'configurador', 'prompt_dafo.txt')

with open(RUTA_PROMPT, 'r', encoding='utf-8') as f:
    TEXTO_PROMPT_DAFO = f.read()

# Usamos from_template directamente porque ya tienes las variables en el texto
PROMPT_DAFO = ChatPromptTemplate.from_template(TEXTO_PROMPT_DAFO)