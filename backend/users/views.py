from django.http import JsonResponse
from django.core.mail import send_mail                                                                                                                            
from django.conf import settings                                                                                                                                  
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView                                                                                                                          
from rest_framework.response import Response                                                                                                                      
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import status                                                                                                                                 
from .serializers import (
    UserRegistrationSerializer, CustomTokenObtainPairSerializer,
    UserProfileSerializer, ChangePasswordSerializer,
    UserListSerializer, UserTipoUpdateSerializer
)
from .models import Usuario, CodigoRecuperacao

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

class PasswordResetRequestView(APIView):                                                                                                                          
        permission_classes = [AllowAny]                                                                                                                               
                                                                                                                                                                      
        def post(self, request):                                                                                                                                      
            email = request.data.get('email')                                                                                                                         
            if not email:                                                                                                                                             
                return Response({"error": "O e-mail é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)                                                             
                                                                                                                                                                      
            try:                                                                                                                                                      
                usuario = Usuario.objects.get(email=email)                                                                                                            
            except Usuario.DoesNotExist:                                                                                                                                                                                                                      
                return Response({"error": "E-mail não cadastrado no sistema."}, status=status.HTTP_404_NOT_FOUND)                                                     
                                                                                                                                                                      
            # Gera o código                                                                                                                                           
            codigo_obj = CodigoRecuperacao.gerar_codigo(usuario)                                                                                                      
                                                                                                                                                                      
            # Dispara o e-mail                                                                                                          
            try:                                                                                                                                                      
                send_mail(                                                                                                                                            
                    subject="Código de Recuperação de Senha",                                                                                                         
                    message=f"Olá {usuario.nome},\n\nSeu código para redefinição de senha é: {codigo_obj.codigo}\n\nEste código expira em 10 minutos.",               
                    from_email=settings.DEFAULT_FROM_EMAIL or "noreply@gestaotarefas.com",                                                                            
                    recipient_list=[usuario.email],                                                                                                                   
                    fail_silently=False,                                                                                                                              
                )                                                                                                                                                     
            except Exception as e:                                                                                                                                    
                return Response({"error": f"Erro ao enviar o e-mail: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)                                        
                                                                                                                                                                      
            return Response({"message": "Código de recuperação enviado com sucesso."}, status=status.HTTP_200_OK)                                                     
                                                                                                                                                                      
                                                                                                                                                                      
class PasswordResetConfirmView(APIView):                                                                                                                          
    permission_classes = [AllowAny]                                                                                                                               
                                                                                                                                                                    
    def post(self, request):                                                                                                                                      
        email = request.data.get('email')                                                                                                                         
        codigo = request.data.get('codigo')                                                                                                                       
        nova_senha = request.data.get('nova_senha')                                                                                                               
                                                                                                                                                                    
        if not all([email, codigo, nova_senha]):                                                                                                                  
            return Response({"error": "Todos os campos (e-mail, código e nova senha) são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)                     
                                                                                                                                                                    
        try:                                                                                                                                                      
            usuario = Usuario.objects.get(email=email)                                                                                                            
        except Usuario.DoesNotExist:                                                                                                                              
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)                                                               
                                                                                                                                                                    
        # Busca o código correspondente                                                                                                                           
        try:                                                                                                                                                      
            codigo_obj = CodigoRecuperacao.objects.filter(usuario=usuario, codigo=codigo).latest('criado_em')                                                     
        except CodigoRecuperacao.DoesNotExist:                                                                                                                    
            return Response({"error": "Código de verificação incorreto."}, status=status.HTTP_400_BAD_REQUEST)                                                    
                                                                                                                                                                    
        # Valida validade e expiração                                                                                                                             
        if not codigo_obj.is_valid():                                                                                                                             
            return Response({"error": "O código expirou ou já foi utilizado."}, status=status.HTTP_400_BAD_REQUEST)                                               
                                                                                                                                                                    
        # Altera a senha do usuário                                                                                                                               
        usuario.set_password(nova_senha)                                                                                                                          
        usuario.save()                                                                                                                                            
                                                                                                                                                                    
        # Invalida o código marcando como usado                                                                                                                   
        codigo_obj.usado = True                                                                                                                                   
        codigo_obj.save()                                                                                                                                         
                                                                                                                                                                    
        return Response({"message": "Senha redefinida com sucesso!"}, status=status.HTTP_200_OK) 
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if not user.check_password(serializer.validated_data['senha_atual']):
            return Response({'error': 'Senha atual incorreta.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['nova_senha'])
        user.save()
        return Response({'message': 'Senha alterada com sucesso!'})

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.tipo not in [Usuario.GESTOR, Usuario.ADMINISTRADOR]:
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        usuarios = Usuario.objects.all().order_by('nome')
        serializer = UserListSerializer(usuarios, many=True)
        return Response(serializer.data)

class UserTipoUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.tipo not in [Usuario.GESTOR, Usuario.ADMINISTRADOR]:
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.pk == pk:
            return Response({'error': 'Você não pode alterar seu próprio tipo.'}, status=status.HTTP_400_BAD_REQUEST)
        # Gestor não pode alterar o tipo de um Administrador
        if request.user.tipo == Usuario.GESTOR and usuario_alvo.tipo == Usuario.ADMINISTRADOR:
            return Response(
                {'error': 'Gestores não podem alterar o tipo de Administradores.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            usuario_alvo = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserTipoUpdateSerializer(usuario_alvo, data=request.data, partial=True, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({'message': 'Tipo de usuário atualizado com sucesso!'})