from django.apps import AppConfig
from django.conf import settings
import logging
from django.core.cache import caches
logger = logging.getLogger(__name__)
class ConfiguradorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'configurador'
    def ready(self):
        import redis
        from langchain_core.globals import set_llm_cache
        from langchain_community.cache import RedisCache

        try:

            redis_client = caches['default'].client.get_client(write=True)
            set_llm_cache(RedisCache(redis_=redis_client))          
        except Exception as e:
            logger.error(f"⚠️ No se pudo inicializar la caché de LangChain en Redis: {e}")
