from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

User = get_user_model()


@extend_schema_serializer(
    component_name="UserRegistration",
    examples=[
        OpenApiExample(
            name="Resposta de Sucesso",
            description="Estrutura retornada após criar o usuário.",
            value={
                "name": "Carlos Andrade",
                "email": "carlos@empresa.com",
                "professional_role": "Desenvolvedor Backend"
            },
            response_only=True
        )
    ]
)

class UserRegistrationSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    professional_role = serializers.CharField(source='cargo_profissional')
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['name', 'email', 'professional_role', 'password']

    def create(self, validated_data):
        is_first_user = not User.objects.exists()
        tipo = User.ADMINISTRADOR if is_first_user else User.COMUM

        user = User(
            username=validated_data['email'],
            email=validated_data['email'],
            nome=validated_data['nome'],
            cargo_profissional=validated_data['cargo_profissional'],
            tipo=tipo,
        )
        
        user.set_password(validated_data['password'])
        user.save()
        return user






@extend_schema_serializer(
    component_name="TokenObtainPair",
    examples=[
        OpenApiExample(
            name="Resposta de Sucesso",
            description="Retorno dos tokens JWT válidos.",
            value={
                "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            },
            response_only=True
        )
    ]
)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['name'] = user.nome
        token['email'] = user.email
        token['role'] = user.tipo
        token['professional_role'] = user.cargo_profissional
        return token







@extend_schema_serializer(
    component_name="UserProfile",
    examples=[
        OpenApiExample(
            name="Exemplo de Perfil (Resposta)",
            description="Dados do perfil retornados para leitura ou após atualização.",
            value={
                "id": 1,
                "name": "Carlos Andrade",
                "email": "carlos@empresa.com",
                "professional_role": "Desenvolvedor Backend",
                "role": "COMUM"
            },
            response_only=True
        )
    ]
)
class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    professional_role = serializers.CharField(source='cargo_profissional')
    role = serializers.CharField(source='tipo', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'professional_role', 'role']
        read_only_fields = ['id', 'email', 'role']





@extend_schema_serializer(
    component_name="ChangePassword",
    examples=[
        OpenApiExample(
            name="Exemplo de Alteração de Senha",
            description="Payload necessário para alterar a senha do usuário.",
            value={
                "current_password": "senha_antiga_123",
                "new_password": "nova_senha_segura_456",
                "confirm_password": "nova_senha_segura_456"
            },
            request_only=True
        )
    ]
)
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'As senhas não conferem.'})
        return data





@extend_schema_serializer(
    component_name="UserList",
    examples=[
        OpenApiExample(
            name="Exemplo de Listagem (Resposta)",
            description="Estrutura de dados retornada ao listar os usuários do sistema.",
            value={
                "id": 2,
                "name": "Mariana Souza",
                "email": "mariana@empresa.com",
                "professional_role": "Designer UX/UI",
                "role": "GESTOR"
            },
            response_only=True
        )
    ]
)
class UserListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome', read_only=True)
    professional_role = serializers.CharField(source='cargo_profissional', read_only=True)
    role = serializers.CharField(source='tipo', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'professional_role', 'role']





@extend_schema_serializer(
    component_name="UserTipoUpdate",
    examples=[
        OpenApiExample(
            name="Exemplo de Atualização de Tipo",
            description="Payload utilizado para alterar o nível de permissão (role) de um usuário.",
            value={
                "role": "GESTOR"
            },
            request_only=True
        )
    ]
)
class UserTipoUpdateSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='tipo')

    class Meta:
        model = User
        fields = ['role']

    def validate_role(self, novo_tipo):
        solicitante = self.context['request'].user
        if novo_tipo not in [User.COMUM, User.GESTOR, User.ADMINISTRADOR]:
            raise serializers.ValidationError('Tipo de usuário inválido.')
        # Regra de hierarquia: Gestor não pode promover para Administrador
        if solicitante.tipo == User.GESTOR and novo_tipo == User.ADMINISTRADOR:
            raise serializers.ValidationError('Gestores não podem promover usuários para Administrador.')
        return novo_tipo
