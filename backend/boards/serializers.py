from rest_framework import serializers
from datetime import date
from .models import Projeto

class ProjectSerializer(serializers.ModelSerializer):
    # Mapeamento do frontend (inglês) para o banco de dados (português)
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao', required=False, allow_blank=True, allow_null=True)
    deadline = serializers.DateTimeField(source='dataFim')
    created_at = serializers.DateTimeField(source='criado_em', read_only=True)
    owner = serializers.PrimaryKeyRelatedField(source='dono', read_only=True)

    class Meta:
        model = Projeto
        fields = ['id', 'name', 'description', 'deadline', 'created_at', 'owner']

    def validate_deadline(self, value):
        # Validação do prazo final impedindo datas anteriores ao dia atual
        if hasattr(value, 'date'):
            value_date = value.date()
        else:
            value_date = value

        if value_date < date.today():
            raise serializers.ValidationError("O prazo final do projeto não pode ser uma data no passado.")
        return value
