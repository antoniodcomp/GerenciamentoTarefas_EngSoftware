from django.http import JsonResponse
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .serializers import UserRegistrationSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer

def hello_backend(request):
    return JsonResponse({
        "status": "Backend online", 
        "mensagem": "Infraestrutura inicial do Django criada com sucesso!"
    })

class UserRegistrationView(CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]