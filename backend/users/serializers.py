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