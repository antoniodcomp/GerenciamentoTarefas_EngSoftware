from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['nome', 'email', 'cargoProfissional', 'password']

    def create(self, validated_data):
        # RF04/RF05: primeiro usuário vira ADMINISTRADOR, demais viram COMUM
        is_first_user = not User.objects.exists()
        tipo = User.ADMINISTRADOR if is_first_user else User.COMUM

        user = User(
            username=validated_data['email'],
            email=validated_data['email'],
            nome=validated_data['nome'],
            cargoProfissional=validated_data['cargoProfissional'],
            tipo=tipo,
        )
        # RNF 3.2.3: senha criptografada, nunca salva em texto puro
        user.set_password(validated_data['password'])
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Dados extras embutidos no token
        token['nome'] = user.nome
        token['email'] = user.email
        token['tipo'] = user.tipo
        return token
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nome', 'email', 'cargoProfissional', 'tipo']
        read_only_fields = ['id', 'email', 'tipo']

class ChangePasswordSerializer(serializers.Serializer):
    senha_atual = serializers.CharField(write_only=True)
    nova_senha = serializers.CharField(write_only=True, min_length=8)
    confirmar_senha = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['nova_senha'] != data['confirmar_senha']:
            raise serializers.ValidationError({'confirmar_senha': 'As senhas não conferem.'})
        return data

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nome', 'email', 'cargoProfissional', 'tipo']

class UserTipoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['tipo']

    def validate_tipo(self, novo_tipo):
        solicitante = self.context['request'].user
        if novo_tipo not in [User.COMUM, User.GESTOR, User.ADMINISTRADOR]:
            raise serializers.ValidationError('Tipo de usuário inválido.')
        # Regra de hierarquia: Gestor não pode promover para Administrador
        if solicitante.tipo == User.GESTOR and novo_tipo == User.ADMINISTRADOR:
            raise serializers.ValidationError('Gestores não podem promover usuários para Administrador.')
        return novo_tipo