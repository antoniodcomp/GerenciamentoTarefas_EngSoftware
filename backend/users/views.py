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
from drf_spectacular.utils import extend_schema,extend_schema_view, OpenApiResponse                                                                                                                             
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

@extend_schema(
    tags=['Autenticação & Usuários'],
    summary="Cadastrar um novo usuário",
    description="Cria uma nova conta no sistema. O primeiro usuário a se cadastrar receberá automaticamente a role de ADMINISTRADOR, enquanto os demais serão criados como COMUM."
)
class UserRegistrationView(CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


@extend_schema(
    tags=['Autenticação & Usuários'],
    summary="Realizar login (Obter Token JWT)",
    description="Autentica o usuário com email e senha, retornando os tokens de acesso (access) e atualização (refresh). O token de acesso conterá as informações de perfil do usuário logado."
)
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
                                                                                                                                                                      

@extend_schema(
    tags=['Autenticação & Usuários'],
    summary="Confirmar recuperação e redefinir senha",
    description="Valida o código de verificação enviado ao e-mail do usuário. Se o código for válido, não tiver expirado e ainda não tiver sido utilizado, a senha é atualizada e o código é invalidado.",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'email': {'type': 'string', 'format': 'email', 'description': 'E-mail do usuário que solicitou a recuperação'},
                'code': {'type': 'string', 'description': 'Código de verificação de 6 dígitos recebido por e-mail'},
                'new_password': {'type': 'string', 'minLength': 8, 'description': 'A nova senha que o usuário deseja cadastrar'}
            },
            'required': ['email', 'code', 'new_password']
        }
    },
    responses={
        200: OpenApiResponse(description="Senha redefinida com sucesso!"),
        400: OpenApiResponse(description="Dados incompletos, código incorreto, expirado ou já utilizado."),
        404: OpenApiResponse(description="Usuário não encontrado.")
    }
)                                                                                                                                                                      
class PasswordResetConfirmView(APIView):                                                                                                                          
    permission_classes = [AllowAny]                                                                                                                               
                                                                                                                                                                    
    def post(self, request):                                                                                                                                      
        email = request.data.get('email')                                                                                                                         
        code = request.data.get('code')                                                                                                                       
        new_password = request.data.get('new_password')                                                                                                               
                                                                                                                                                                    
        if not all([email, code, new_password]):                                                                                                                  
            return Response({"error": "Todos os campos (email, code e new_password) são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)                     
                                                                                                                                                                    
        try:                                                                                                                                                      
            usuario = Usuario.objects.get(email=email)                                                                                                            
        except Usuario.DoesNotExist:                                                                                                                              
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)                                                               
                                                                                                                                                                    
        # Busca o código correspondente                                                                                                                           
        try:                                                                                                                                                      
            codigo_obj = CodigoRecuperacao.objects.filter(usuario=usuario, codigo=code).latest('criado_em')                                                     
        except CodigoRecuperacao.DoesNotExist:                                                                                                                    
            return Response({"error": "Código de verificação incorreto."}, status=status.HTTP_400_BAD_REQUEST)                                                    
                                                                                                                                                                    
        # Valida validade e expiração                                                                                                                             
        if not codigo_obj.is_valid():                                                                                                                             
            return Response({"error": "O código expirou ou já foi utilizado."}, status=status.HTTP_400_BAD_REQUEST)                                               
                                                                                                                                                                    
        # Altera a senha do usuário                                                                                                                               
        usuario.set_password(new_password)                                                                                                                          
        usuario.save()                                                                                                                                            
                                                                                                                                                                    
        # Invalida o código marcando como usado                                                                                                                   
        codigo_obj.usado = True                                                                                                                                   
        codigo_obj.save()                                                                                                                                         
                                                                                                                                                                    
        return Response({"message": "Senha redefinida com sucesso!"}, status=status.HTTP_200_OK)
    




@extend_schema_view(
    get=extend_schema(
        tags=['Autenticação & Usuários'],
        summary="Obter perfil do usuário logado",
        description="Retorna os dados detalhados do perfil do usuário autenticado através do Token JWT.",
        responses={200: UserProfileSerializer}
    ),
    patch=extend_schema(
        tags=['Autenticação & Usuários'],
        summary="Atualizar parcialmente o perfil",
        description="Permite que o usuário logado atualize campos do seu perfil (como nome ou cargo profissional). Campos como 'email' e 'role' são protegidos e ignorados.",
        request=UserProfileSerializer,
        responses={
            200: UserProfileSerializer,
            400: OpenApiResponse(description="Dados fornecidos são inválidos.")
        }
    )
)   
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




@extend_schema(
    tags=['Autenticação & Usuários'],
    summary="Alterar senha da conta",
    description="Permite que o usuário autenticado altere sua senha atual. O sistema valida se a senha atual está correta e se a nova senha coincide com a confirmação.",
    request=ChangePasswordSerializer,
    responses={
        200: OpenApiResponse(description="Senha alterada com sucesso!"),
        400: OpenApiResponse(description="Validação falhou (senhas não batem ou senha atual incorreta).")
    }
)
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return Response({'error': 'Senha atual incorreta.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Senha alterada com sucesso!'})


@extend_schema(
    tags=['Autenticação & Usuários'],
    summary="Listar todos os usuários",
    description="Retorna uma lista ordenada por nome com todos os usuários do sistema. Acesso restrito a usuários com perfil GESTOR ou ADMINISTRADOR.",
    responses={
        200: UserListSerializer(many=True),
        403: OpenApiResponse(description="Acesso negado (usuário não possui permissões administrativas).")
    }
)
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.tipo not in [Usuario.GESTOR, Usuario.ADMINISTRADOR]:
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        usuarios = Usuario.objects.all().order_by('nome')
        serializer = UserListSerializer(usuarios, many=True)
        return Response(serializer.data)




@extend_schema(
    tags=['Autenticação & Usuários'],
    summary="Atualizar tipo (role) de um usuário",
    description="Altera o nível de acesso de um usuário específico (ID fornecido na URL). Acesso restrito a GESTORES e ADMINISTRADORES, respeitando as regras de hierarquia (ex: Gestor não altera Administrador, e ninguém altera o próprio tipo).",
    request=UserTipoUpdateSerializer,
    responses={
        200: OpenApiResponse(description="Tipo de usuário atualizado com sucesso!"),
        400: OpenApiResponse(description="Requisição inválida (tentativa de alterar o próprio tipo ou validação de role falhou)."),
        403: OpenApiResponse(description="Acesso negado ou violação de hierarquia entre Gestor e Administrador."),
        404: OpenApiResponse(description="Usuário alvo não encontrado.")
    }
)
class UserTipoUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.tipo not in [Usuario.GESTOR, Usuario.ADMINISTRADOR]:
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.pk == pk:
            return Response({'error': 'Você não pode alterar seu próprio tipo.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            usuario_alvo = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        # Gestor não pode alterar o tipo de um Administrador
        if request.user.tipo == Usuario.GESTOR and usuario_alvo.tipo == Usuario.ADMINISTRADOR:
            return Response(
                {'error': 'Gestores não podem alterar o tipo de Administradores.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = UserTipoUpdateSerializer(usuario_alvo, data=request.data, partial=True, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({'message': 'Tipo de usuário atualizado com sucesso!'})