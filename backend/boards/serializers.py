from django.contrib.auth import get_user_model
from rest_framework import serializers
from datetime import date
from .models import Projeto, Tarefa, Subtarefa, Anexo, ComentarioTarefa

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    # Mapeamento do frontend (inglês) para o banco de dados (português)
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao', required=False, allow_blank=True, allow_null=True)
    deadline = serializers.DateTimeField(source='dataFim')
    created_at = serializers.DateTimeField(source='criado_em', read_only=True)
    owner = serializers.PrimaryKeyRelatedField(source='dono', read_only=True)
    participantes = serializers.PrimaryKeyRelatedField(
            queryset=User.objects.all(), 
            many=True, 
            required=False
        )


    class Meta:
        model = Projeto
        fields = ['id', 'name', 'description', 'deadline', 'created_at', 'owner', 'participantes']

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
    """
    Serializer simples para listar tarefas no dashboard, 
    especialmente útil para listar as tarefas atrasadas (RF59)
    """
    class Meta:
        model = Tarefa
        fields = ['id', 'nome', 'status', 'dataFim']


class ProjectDashboardSerializer(serializers.ModelSerializer):
    """
    Serializer dedicado a compilar os dados do Dashboard (UC14 e RF59).
    Mantém o padrão em inglês das chaves para facilitar para o frontend.
    """
    name = serializers.CharField(source='nome', read_only=True)
    description = serializers.CharField(source='descricao', read_only=True)
    start_date = serializers.DateTimeField(source='dataInicio', read_only=True)
    deadline = serializers.DateTimeField(source='dataFim', read_only=True)
    
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
            'id', 'name', 'description', 'start_date', 'deadline', 
            'total_tasks', 'pending_tasks', 'in_progress_tasks', 
            'completed_tasks', 'progress_percentage', 'delayed_tasks',
            'all_tasks'
        ]


class TaskCreateSerializer(serializers.ModelSerializer):
        # O frontend não envia o status, o backend assume o controle (RF18)
        status = serializers.CharField(read_only=True)

        class Meta:
            model = Tarefa
            fields = ['id', 'nome', 'descricao', 'dataFim', 'projeto', 'status']

        def validate_nome(self, value):
            # UC15: Barrar registro se campo obrigatório estiver em branco
            if not value or value.strip() == "":
                raise serializers.ValidationError("O título da tarefa é obrigatório.")
            return value

        def validate_dataFim(self, value):
            # UC15: Não permite tarefa sem prazo
            if not value:
                raise serializers.ValidationError("O prazo final da tarefa é obrigatório.")
            # Se quiser, podemos validar se a dataFim da tarefa ultrapassa a dataFim do Projeto.
            return value

class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarefa
        fields = ['id', 'nome', 'descricao', 'dataFim', 'status']

class SubtaskCreateSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Subtarefa
        fields = ['id', 'nome', 'descricao', 'dataFim', 'tarefa', 'status']

    def validate_nome(self, value):
        if not value or value.strip() == "":
            raise serializers.ValidationError("O título da subtarefa é obrigatório.")
        return value

    def validate_dataFim(self, value):
        if not value:
            raise serializers.ValidationError("O prazo final da subtarefa é obrigatório.")
        return value

class SubtaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtarefa
        fields = ['id', 'nome', 'descricao', 'dataFim', 'status']

class SubtaskResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtarefa
        fields = ['id', 'nome', 'status', 'dataFim']

class AnexoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Anexo
        fields = ['id', 'nomeArquivo', 'caminhoArquivo', 'dataHoraUpload', 'usuario', 'usuario_nome', 'tarefa']
        read_only_fields = ['usuario', 'dataHoraUpload']

    def validate_caminhoArquivo(self, value):
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
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = ComentarioTarefa
        fields = ['id', 'texto', 'data', 'usuario', 'usuario_nome', 'tarefa']
        read_only_fields = ['usuario', 'data']

    def validate_texto(self, value):
        if not value or value.strip() == "":
            raise serializers.ValidationError("O texto do comentário é obrigatório.")
        return value

class TaskDetailSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    subtarefas = SubtaskResumoSerializer(many=True, read_only=True)
    anexos = AnexoSerializer(many=True, read_only=True)
    comentarios = ComentarioTarefaSerializer(many=True, read_only=True)

    class Meta:
        model = Tarefa
        fields = ['id', 'nome', 'descricao', 'dataFim', 'projeto', 'status', 'subtarefas', 'anexos', 'comentarios']

