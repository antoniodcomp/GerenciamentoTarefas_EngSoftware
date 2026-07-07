from django.contrib.auth import get_user_model
from rest_framework import serializers
from datetime import date
from .models import Projeto, Tarefa, Subtarefa, Anexo, ComentarioTarefa

User = get_user_model()


class ProjetoSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao', required=False, allow_blank=True, allow_null=True)
    startline = serializers.DateTimeField(source='data_inicio', required=False, allow_null=True)
    deadline = serializers.DateTimeField(source='data_fim')
    owner = serializers.PrimaryKeyRelatedField(source='dono', read_only=True)
    created_at = serializers.DateTimeField(source='criado_em', read_only=True)
    participantes = serializers.PrimaryKeyRelatedField(
            queryset=User.objects.all(), 
            many=True, 
            required=False
        )


    class Meta:
        model = Projeto
        fields = ['id', 'name', 'description', 'startline', 'deadline', 'owner', 'created_at', 'participantes']

    def validate_deadline(self, value):
        # Validação do prazo final impedindo datas anteriores ao dia atual
        if hasattr(value, 'date'):
            value_date = value.date()
        else:
            value_date = value

        if value_date < date.today():
            raise serializers.ValidationError("O prazo final do projeto não pode ser uma data no passado.")
        return value

class TarefaResumoSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome', read_only=True)
    status = serializers.CharField(read_only=True)
    deadline = serializers.DateTimeField(source='data_fim', read_only=True)
    
    class Meta:
        model = Tarefa
        fields = ['id', 'name', 'status', 'deadline']

class TarefaCreateSerializer(serializers.ModelSerializer):
        name = serializers.CharField(source='nome')
        description = serializers.CharField(source='descricao')
        deadline = serializers.DateTimeField(source='data_fim')
        project = serializers.PrimaryKeyRelatedField(queryset=Projeto.objects.all(), source='projeto')
        status = serializers.CharField(read_only=True)

        class Meta:
            model = Tarefa
            fields = ['id', 'name', 'description', 'deadline', 'project', 'status']

        def validate_name(self, value):
            # Barrar registro se campo obrigatório estiver em branco
            if not value or value.strip() == "":
                raise serializers.ValidationError("O título da tarefa é obrigatório.")
            return value

        def validate_deadline(self, value):
            # Não permite tarefa sem prazo
            if not value:
                raise serializers.ValidationError("O prazo final da tarefa é obrigatório.")
            return value

class TarefaUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao')
    deadline = serializers.DateTimeField(source='data_fim')
    status = serializers.CharField()
    
    class Meta:
        model = Tarefa
        fields = ['id', 'name', 'description' , 'deadline', 'status']

class SubtarefaResumoSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome', read_only=True)
    status = serializers.CharField(read_only=True)
    deadline = serializers.DateTimeField(source='data_fim', read_only=True)

    class Meta:
        model = Subtarefa
        fields = ['id', 'name', 'status', 'deadline']

class SubtarefaCreateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao', required=False, allow_blank=True, allow_null=True)
    deadline = serializers.DateTimeField(source='data_fim')
    task = serializers.PrimaryKeyRelatedField(queryset=Tarefa.objects.all(), source='tarefa')
    status = serializers.CharField(read_only=True)
    
    class Meta:
        model = Subtarefa
        fields = ['id', 'name', 'description', 'deadline', 'task', 'status']

    def validate_name(self, value):
        if not value or value.strip() == "":
            raise serializers.ValidationError("O título da subtarefa é obrigatório.")
        return value

    def validate_deadline(self, value):
        if not value:
            raise serializers.ValidationError("O prazo final da subtarefa é obrigatório.")
        return value

class SubtarefaUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao')
    deadline = serializers.DateTimeField(source='data_fim')
    status = serializers.CharField()

    class Meta:
        model = Subtarefa
        fields = ['id', 'name', 'description', 'deadline', 'status']

class AnexoSerializer(serializers.ModelSerializer):
    file_name = serializers.CharField(source='nome_arquivo')
    file_path = serializers.FileField(source='caminho_arquivo')
    date_time_upload = serializers.DateTimeField(source='data_hora_upload', read_only=True)
    user = serializers.PrimaryKeyRelatedField(source='usuario', read_only=True)
    user_name = serializers.CharField(source='usuario.username', read_only=True)
    task = serializers.PrimaryKeyRelatedField(queryset=Tarefa.objects.all(), source='tarefa')

    class Meta:
        model = Anexo
        fields = ['id', 'file_name', 'file_path', 'date_time_upload', 'user', 'user_name', 'task']

    def validate_file_path(self, value):
        # Limite de 5MB
        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("O arquivo não pode exceder 5MB.")
            
        # Formatos permitidos
        valid_extensions = ['pdf', 'jpg', 'jpeg', 'png', 'txt', 'doc', 'docx']
        ext = value.name.split('.')[-1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError(f"Formato de arquivo não suportado. Formatos válidos: {', '.join(valid_extensions)}.")
        return value

class ComentarioTarefaSerializer(serializers.ModelSerializer):
    text = serializers.CharField(source='texto')
    date = serializers.DateTimeField(source='data', read_only=True)
    user = serializers.PrimaryKeyRelatedField(source='usuario', read_only=True)
    user_name = serializers.CharField(source='usuario.username', read_only=True)
    task = serializers.PrimaryKeyRelatedField(queryset=Tarefa.objects.all(), source='tarefa')

    class Meta:
        model = ComentarioTarefa
        fields = ['id', 'text', 'date', 'user', 'user_name', 'task']

    def validate_text(self, value):
        if not value or value.strip() == "":
            raise serializers.ValidationError("O texto do comentário é obrigatório.")
        return value
    
class TarefaDetailSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao')
    deadline = serializers.DateTimeField(source='data_fim')
    project = serializers.PrimaryKeyRelatedField(queryset=Projeto.objects.all(), source='projeto')
    status = serializers.CharField(read_only=True)
    subtasks = SubtarefaResumoSerializer(source='subtarefas', many=True, read_only=True)
    files = AnexoSerializer(source='anexos', many=True, read_only=True)
    comments = ComentarioTarefaSerializer(source='comentarios', many=True, read_only=True)

    class Meta:
        model = Tarefa
        fields = ['id', 'name', 'description', 'deadline', 'project', 'status', 'subtasks', 'files', 'comments']

class ProjetoDashboardSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome', read_only=True)
    description = serializers.CharField(source='descricao', read_only=True)
    startline = serializers.DateTimeField(source='data_inicio', read_only=True)
    deadline = serializers.DateTimeField(source='data_fim', read_only=True)
    
    # Indicadores Calculados
    total_tasks = serializers.IntegerField(read_only=True)
    pending_tasks = serializers.IntegerField(read_only=True)
    in_progress_tasks = serializers.IntegerField(read_only=True)
    completed_tasks = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    
    # Lista de tarefas atrasadas
    delayed_tasks = TarefaResumoSerializer(many=True, read_only=True)
    
    # Lista de TODAS as tarefas vinculadas ao projeto
    all_tasks = TarefaResumoSerializer(source='tarefas', many=True, read_only=True)

    class Meta:
        model = Projeto
        fields = [
            'id', 'name', 'description', 'startline', 'deadline', 
            'total_tasks', 'pending_tasks', 'in_progress_tasks', 
            'completed_tasks', 'progress_percentage', 'delayed_tasks',
            'all_tasks'
        ]


