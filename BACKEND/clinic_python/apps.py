from django.apps import AppConfig


class ClinicPythonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'clinic_python'

def ready(self):
    import clinic_python.signals
