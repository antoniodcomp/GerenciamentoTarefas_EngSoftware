from django.http import JsonResponse
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .serializers import UserRegistrationSerializer

def hello_backend(request):
    return JsonResponse({
        "status": "Backend online", 
        "mensagem": "Infraestrutura inicial do Django criada com sucesso!"
    })

class UserRegistrationView(CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
