from django.apps import AppConfig

class BoardsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'boards'

    def ready(self):
        # Importa os signals assim que o app iniciar
        import boards.signals