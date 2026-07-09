from django.contrib.auth import get_user_model
from rest_framework import serializers
from datetime import date
from .models import Projeto, Tarefa, Subtarefa, Anexo, ComentarioTarefa
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

User = get_user_model()


@extend_schema_serializer(
    component_name="Projeto",
    examples=[
        OpenApiExample(
            name="Exemplo de Criação de Projeto",
            description="Payload padrão enviado pelo frontend para registrar um novo projeto com participantes.",
            value={
                "name": "Novo Sistema de Vendas",
                "description": "Desenvolvimento do módulo de checkout e gateway de pagamento.",
                "startline": "2026-07-10T09:00:00Z",
                "deadline": "2026-12-31T18:00:00Z",
                "participantes": [2, 5, 8]
            },
            request_only=True,
        ),
        OpenApiExample(
            name="Exemplo de Resposta de Projeto",
            description="Dados retornados pela API após a criação ou leitura de um projeto.",
            value={
                "id": 1,
                "name": "Novo Sistema de Vendas",
                "description": "Desenvolvimento do módulo de checkout e gateway de pagamento.",
                "startline": "2026-07-10T09:00:00Z",
                "deadline": "2026-12-31T18:00:00Z",
                "owner": 1,
                "created_at": "2026-07-08T14:30:22Z",
                "participantes": [2, 5, 8]
            },
            response_only=True,
        )
    ]
)

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
    progress_percentage = serializers.SerializerMethodField()
    total_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Projeto
        fields = ['id', 'name', 'description', 'startline', 'deadline', 'owner', 'created_at', 'participantes', 'progress_percentage', 'total_tasks']

    def get_progress_percentage(self, obj):
        tarefas = obj.tarefas.all()
        total_tasks = tarefas.count()
        if total_tasks == 0:
            return 0
        completed_tasks = tarefas.filter(status='CONCLUIDA').count()
        return round((completed_tasks / total_tasks * 100), 2)
        
    def get_total_tasks(self, obj):
        return obj.tarefas.count()

    def validate_deadline(self, value):
        # Validação do prazo final impedindo datas anteriores ao dia atual
        if hasattr(value, 'date'):
            value_date = value.date()
        else:
            value_date = value

        if value_date < date.today():
            raise serializers.ValidationError("O prazo final do projeto não pode ser uma data no passado.")
        return value
    
    def validate(self, data):
        # O DRF armazena os dados internamente usando o nome original do modelo (source='data_inicio')
        data_inicio = data.get('data_inicio')
        data_fim = data.get('data_fim')

        if data_inicio and data_fim and data_fim < data_inicio:
            raise serializers.ValidationError(
                # Retornamos o erro no campo 'deadline' para o React destacar o campo correto na tela
                {"deadline": "A data de término não pode ser cronologicamente anterior à data de início."}
            )
        return data









@extend_schema_serializer(
    component_name="TarefaResumo",
    examples=[
        OpenApiExample(
            name="Exemplo de Resumo da Tarefa",
            description="Formato simplificado retornado em listagens ou dashboards.",
            value={
                "id": 10,
                "name": "Configurar Pipeline de CI/CD",
                "status": "Em Andamento",
                "deadline": "2026-08-15T23:59:59Z"
            },
            response_only=True
        )
    ]
)
class TarefaResumoSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome', read_only=True)
    description = serializers.CharField(source='descricao', read_only=True)
    status = serializers.CharField(read_only=True)
    deadline = serializers.DateTimeField(source='data_fim', read_only=True)
    participantes = serializers.SerializerMethodField()
    
    class Meta:
        model = Tarefa
        fields = ['id', 'name', 'description', 'status', 'deadline', 'participantes']

    def get_participantes(self, obj):
        return [
            {
                'id': u.id,
                'name': u.nome
            } for u in obj.participantes.all()
        ]









@extend_schema_serializer(
    component_name="TarefaResumo",
    examples=[
        OpenApiExample(
            name="Exemplo de Resumo da Tarefa",
            description="Formato simplificado retornado em listagens ou dashboards.",
            value={
                "id": 10,
                "name": "Configurar Pipeline de CI/CD",
                "status": "Em Andamento",
                "deadline": "2026-08-15T23:59:59Z"
            },
            response_only=True
        )
    ]
)
class TarefaCreateSerializer(serializers.ModelSerializer):
        name = serializers.CharField(source='nome')
        description = serializers.CharField(source='descricao')
        startline = serializers.DateTimeField(source='data_inicio', required=False, allow_null=True)
        deadline = serializers.DateTimeField(source='data_fim')
        project = serializers.PrimaryKeyRelatedField(queryset=Projeto.objects.all(), source='projeto')
        participantes = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)
        status = serializers.CharField(read_only=True)

        class Meta:
            model = Tarefa
            fields = ['id', 'name', 'description', 'startline', 'deadline', 'project', 'participantes', 'status']

        def validate_name(self, value):
            if not value or value.strip() == "":
                raise serializers.ValidationError("O título da tarefa é obrigatório.")
            return value

        def validate_deadline(self, value):
            if not value:
                raise serializers.ValidationError("O prazo final da tarefa é obrigatório.")
            return value

        def validate(self, data):
            data_inicio = data.get('data_inicio')
            data_fim = data.get('data_fim')

            if data_inicio and data_fim and data_fim < data_inicio:
                raise serializers.ValidationError(
                    {"deadline": "A data de término não pode ser cronologicamente anterior à data de início."}
                )
            return data






@extend_schema_serializer(
    component_name="TarefaAtualizar",
    examples=[
        OpenApiExample(
            name="Exemplo de Atualização de Tarefa (PUT/PATCH)",
            description="Payload enviado pelo frontend para modificar os dados de uma tarefa existente ou alterar seu status.",
            value={
                "name": "Criar endpoints de autenticação - Refatorado",
                "description": "Desenvolver login, logout e aplicar segurança extra com Refresh Tokens.",
                "startline": "2026-07-15T08:00:00Z",
                "deadline": "2026-07-25T18:00:00Z",
                "status": "Em Andamento"
            },
            request_only=True
        ),
        OpenApiExample(
            name="Exemplo de Resposta após Atualização",
            description="Dados retornados pela API confirmando as alterações salvas.",
            value={
                "id": 11,
                "name": "Criar endpoints de autenticação - Refatorado",
                "description": "Desenvolver login, logout e aplicar segurança extra com Refresh Tokens.",
                "startline": "2026-07-15T08:00:00Z",
                "deadline": "2026-07-25T18:00:00Z",
                "status": "Em Andamento"
            },
            response_only=True
        )
    ]
)
class TarefaUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao')
    startline = serializers.DateTimeField(source='data_inicio', required=False, allow_null=True)
    deadline = serializers.DateTimeField(source='data_fim')
    status = serializers.CharField()
    
    class Meta:
        model = Tarefa
        fields = ['id', 'name', 'description', 'startline', 'deadline', 'status']

    def validate(self, data):
        data_inicio = data.get('data_inicio')
        data_fim = data.get('data_fim')

        if data_inicio and data_fim and data_fim < data_inicio:
            raise serializers.ValidationError(
                {"deadline": "A data de término não pode ser cronologicamente anterior à data de início."}
            )
        return data








@extend_schema_serializer(
    component_name="SubtarefaResumo",
    examples=[
        OpenApiExample(
            name="Exemplo de Resumo da Subtarefa",
            description="JSON simplificado retornado em listagens de subatividades dentro de uma tarefa.",
            value={
                "id": 150,
                "name": "Criar migration da tabela de anexos",
                "status": "Concluído",
                "deadline": "2026-07-12T12:00:00Z"
            },
            response_only=True
        )
    ]
)
class SubtarefaResumoSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome', read_only=True)
    description = serializers.CharField(source='descricao', read_only=True)
    status = serializers.CharField(read_only=True)
    deadline = serializers.DateTimeField(source='data_fim', read_only=True)

    class Meta:
        model = Subtarefa
        fields = ['id', 'name', 'description', 'status', 'deadline']








@extend_schema_serializer(
    component_name="SubtarefaCriar",
    examples=[
        OpenApiExample(
            name="Exemplo de Criação de Subtarefa",
            description="Payload padrão para criar uma nova subtarefa atrelada a uma tarefa pai.",
            value={
                "name": "Escrever testes unitários do serializer",
                "description": "Cobrir validações de data de início e término.",
                "deadline": "2026-07-20T18:00:00Z",
                "task": 11
            },
            request_only=True
        ),
        OpenApiExample(
            name="Exemplo de Resposta após Criação",
            description="Estrutura de dados devolvida pela API após salvar a subtarefa com sucesso.",
            value={
                "id": 151,
                "name": "Escrever testes unitários do serializer",
                "description": "Cobrir validações de data de início e término.",
                "deadline": "2026-07-20T18:00:00Z",
                "task": 11,
                "status": "Pendente"
            },
            response_only=True
        )
    ]
)
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




@extend_schema_serializer(
    component_name="Atualizar Subtarefa",
    examples=[
        OpenApiExample(
            name="Exemplo de Atualização de Subtarefa (PUT/PATCH)",
            description="Payload enviado para modificar os dados ou alterar o status de conclusão de uma subtarefa.",
            value={
                "name": "Escrever testes unitários do serializer - Finalizado",
                "description": "Todos os cenários de validação cronológica foram validados com sucesso.",
                "deadline": "2026-07-22T15:00:00Z",
                "status": "Concluído"
            },
            request_only=True
        ),
        OpenApiExample(
            name="Exemplo de Resposta após Atualização",
            description="Estrutura de dados retornada pela API confirmando que as alterações foram salvas.",
            value={
                "id": 151,
                "name": "Escrever testes unitários do serializer - Finalizado",
                "description": "Todos os cenários de validação cronológica foram validados com sucesso.",
                "deadline": "2026-07-22T15:00:00Z",
                "status": "Concluído"
            },
            response_only=True
        )
    ]
)
class SubtarefaUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao')
    deadline = serializers.DateTimeField(source='data_fim')
    status = serializers.CharField()

    class Meta:
        model = Subtarefa
        fields = ['id', 'name', 'description', 'deadline', 'status']










@extend_schema_serializer(
    component_name="Anexo",
    examples=[
        OpenApiExample(
            name="Resposta de Sucesso",
            description="Exemplo simplificado do retorno após o upload.",
            value={
                "id": 1,
                "file_name": "documento.pdf",
                "file_path": "http://localhost:8000/media/anexos/documento.pdf",
                "date_time_upload": "2026-07-08T19:41:00Z",
                "user": 2,
                "user_name": "dev_usuario",
                "task": 5
            },
            response_only=True
        )
    ]
)
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










@extend_schema_serializer(
    component_name="ComentarioTarefa",
    examples=[
        OpenApiExample(
            name="Exemplo de Criação de Comentário",
            description="Payload padrão enviado para adicionar um novo comentário a uma tarefa.",
            value={
                "texto": "Já finalizei a estrutura do banco, vou iniciar os testes amanhã.",
                "task": 12
            },
            request_only=True
        ),
        OpenApiExample(
            name="Exemplo de Resposta de Comentário",
            description="Estrutura retornada contendo os dados do autor gerados pelo servidor.",
            value={
                "id": 89,
                "texto": "Já finalizei a estrutura do banco, vou iniciar os testes amanhã.",
                "date_time": "2026-07-08T19:45:00Z",
                "user": 3,
                "user_name": "joao_silva",
                "task": 12
            },
            response_only=True
        )
    ]
)
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






@extend_schema_serializer(
    component_name="TarefaDetalhes",
    examples=[
        OpenApiExample(
            name="Exemplo de Detalhes da Tarefa",
            description="Payload completo retornado no endpoint de retrieve, trazendo dados aninhados.",
            value={
                "id": 12,
                "name": "Configurar Pipeline de CI/CD",
                "description": "Configurar GitHub Actions para rodar testes automáticos e fazer deploy.",
                "startline": "2026-07-10T08:00:00Z",
                "deadline": "2026-07-15T18:00:00Z",
                "status": "Em Andamento",
                "project": 1,
                "subtasks": [
                    {"id": 150, "name": "Criar chaves SSH", "status": "Concluído", "deadline": "2026-07-11T12:00:00Z"}
                ],
                "comments": [
                    {"id": 89, "texto": "Servidor da AWS configurado.", "user_name": "joao_silva"}
                ],
                "attachments": [
                    {"id": 45, "file_name": "diagrama_arquitetura.png", "file_path": "http://..."}
                ]
            },
            response_only=True
        )
    ]
)
class TarefaDetailSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nome')
    description = serializers.CharField(source='descricao')
    deadline = serializers.DateTimeField(source='data_fim')
    project = serializers.PrimaryKeyRelatedField(queryset=Projeto.objects.all(), source='projeto')
    project_name = serializers.CharField(source='projeto.nome', read_only=True)
    status = serializers.CharField(read_only=True)
    subtasks = SubtarefaResumoSerializer(source='subtarefas', many=True, read_only=True)
    files = AnexoSerializer(source='anexos', many=True, read_only=True)
    comments = ComentarioTarefaSerializer(source='comentarios', many=True, read_only=True)
    participantes = serializers.SerializerMethodField()

    class Meta:
        model = Tarefa
        fields = ['id', 'name', 'description', 'deadline', 'project', 'project_name', 'status', 'subtasks', 'files', 'comments', 'participantes']

    def get_participantes(self, obj):
        return [
            {
                'id': u.id,
                'name': u.nome
            } for u in obj.participantes.all()
        ]





@extend_schema_serializer(
    component_name="ProjetoDashboard",
    examples=[
        OpenApiExample(
            name="Resposta do Dashboard",
            description="Exemplo simplificado dos indicadores do projeto e suas tarefas.",
            value={
                "id": 1,
                "name": "Expansão da Infraestrutura",
                "description": "Migração de servidores locais para nuvem.",
                "startline": "2026-01-10T08:00:00Z",
                "deadline": "2026-12-25T18:00:00Z",
                "total_tasks": 10,
                "pending_tasks": 3,
                "in_progress_tasks": 5,
                "completed_tasks": 2,
                "progress_percentage": 20.0,
                "delayed_tasks": [
                    {"id": 4, "name": "Comprar licenças", "status": "Pendente", "deadline": "2026-06-01T18:00:00Z"}
                ],
                "all_tasks": [
                    {"id": 4, "name": "Comprar licenças", "status": "Pendente", "deadline": "2026-06-01T18:00:00Z"},
                    {"id": 5, "name": "Configurar VPC", "status": "Em Andamento", "deadline": "2026-08-30T18:00:00Z"}
                ]
            },
            response_only=True
        )
    ]
)
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
    
    # Detalhes dos participantes
    participantes = serializers.SerializerMethodField()

    class Meta:
        model = Projeto
        fields = [
            'id', 'name', 'description', 'startline', 'deadline', 
            'total_tasks', 'pending_tasks', 'in_progress_tasks', 
            'completed_tasks', 'progress_percentage', 'delayed_tasks',
            'all_tasks', 'participantes'
        ]

    def get_participantes(self, obj):
        return [
            {
                'id': u.id, 
                'name': u.nome, 
                'email': u.email, 
                'role': u.tipo,
                'professional_role': u.cargo_profissional
            } for u in obj.participantes.all()
        ]


