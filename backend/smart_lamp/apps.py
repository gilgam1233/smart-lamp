import os

from django.apps import AppConfig


class SmartLampConfig(AppConfig):
    name = 'smart_lamp'

    def ready(self):
        if os.environ.get('RUN_MAIN') == 'true':
            from .mqtt import start_mqtt
            start_mqtt()