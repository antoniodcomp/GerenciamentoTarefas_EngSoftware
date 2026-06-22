from rest_framework.authentication import BaseAuthentication
from django.contrib.auth import get_user_model

class DevelopmentAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Cria ou obtém o usuário 'gestor' padrão para testar localmente
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username='gestor',
            defaults={
                'email': 'gestor@exemplo.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user.set_password('senha123')
            user.save()
            
        return (user, None)
