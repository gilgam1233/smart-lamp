import os
import sys
from django.apps import AppConfig

class SmartLampConfig(AppConfig):
    name = 'smart_lamp'

    def ready(self):
        if 'migrate' in sys.argv or 'makemigrations' in sys.argv:
            return

        from .mqtt import start_mqtt

        if 'runserver' in sys.argv:
            if os.environ.get('RUN_MAIN') == 'true':
                start_mqtt()
        else:
            start_mqtt()