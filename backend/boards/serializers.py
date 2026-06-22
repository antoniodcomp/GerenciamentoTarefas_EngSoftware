from rest_framework import serializers
from datetime import date
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    # O owner é definido como read_only para que o backend defina-o de forma segura a partir do usuário autenticado
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'deadline', 'created_at', 'owner']

    def validate_deadline(self, value):
        # Sobrescrita da validação do prazo: impede datas anteriores à data de hoje
        if value < date.today():
            raise serializers.ValidationError("O prazo final do projeto não pode ser uma data no passado.")
        return value
