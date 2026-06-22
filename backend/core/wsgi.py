import os
from django.core.wsgi import get_wsgi_application

# Informa ao servidor onde estão as configurações do projeto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()