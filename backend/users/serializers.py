from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    professional_role = serializers.CharField(source='cargo_profissional')
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['name', 'email', 'professional_role', 'password']

    def create(self, validated_data):
        # RF04/RF05: primeiro usuário vira ADMINISTRADOR, demais viram COMUM
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

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['name'] = user.nome
        token['email'] = user.email
        token['role'] = user.tipo
        token['professional_role'] = user.cargo_profissional
        return token
    
class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    professional_role = serializers.CharField(source='cargo_profissional')
    role = serializers.CharField(source='tipo', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'professional_role', 'role']
        read_only_fields = ['id', 'email', 'role']

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'As senhas não conferem.'})
        return data

class UserListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome', read_only=True)
    professional_role = serializers.CharField(source='cargo_profissional', read_only=True)
    role = serializers.CharField(source='tipo', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'professional_role', 'role']

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
