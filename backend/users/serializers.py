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
        return token