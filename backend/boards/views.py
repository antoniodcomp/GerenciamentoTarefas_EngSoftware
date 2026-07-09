from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Projeto, Tarefa, Subtarefa, Anexo, ComentarioTarefa
from .serializers import ProjetoSerializer, ProjetoDashboardSerializer, TarefaCreateSerializer, SubtarefaCreateSerializer, TarefaDetailSerializer, AnexoSerializer, ComentarioTarefaSerializer, TarefaUpdateSerializer, SubtarefaUpdateSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from .permissions import IsDonoOuParticipanteDoProjeto
from .service import projeto_service, task_service
from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema(
    tags=["Projetos"],
    summary="Gerenciar projetos",
    description=(
            "Retorna indicadores agregados (total, pendentes, em andamento, concluídas, "
            "percentual de progresso e tarefas atrasadas) para o projeto especificado."
        )
)

class ProjetoViewSet(viewsets.ModelViewSet):
    # queryset = Projeto.objects.all().order_by('-criado_em')
    serializer_class = ProjetoSerializer
    permission_classes = [IsAuthenticated, IsDonoOuParticipanteDoProjeto]

    def perform_create(self, serializer):
        # Salva o projeto vinculando o dono (owner) como o usuário autenticado atual
        serializer.save(dono=self.request.user)

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Projeto.objects.none()
        
        return Projeto.objects.filter(
            Q(dono=user) | Q(participantes=user)
        ).distinct().order_by('-criado_em')

    def destroy(self, request, *args, **kwargs):
        # Apenas gestores ou administradores podem excluir projetos
        if request.user.tipo not in ['GESTOR', 'ADMINISTRADOR']:
            raise PermissionDenied("Apenas gestores ou administradores podem excluir projetos.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """
        Endpoint: GET /api/projects/{id}/dashboard/
        Atende aos requisitos RF59 e UC14.
        Retorna os dados gerais do projeto e as métricas calculadas em tempo real.
        """
        projeto = self.get_object() # Garante que o projeto existe e o usuário tem permissão
        
        # Delegando a chamada para a classe service
        projeto_processado = projeto_service.ProjetoService.preparar_dados_dashboard(projeto)
        
        # Serializa com o serializer de dashboard
        serializer = ProjetoDashboardSerializer(projeto_processado)
        
        # O UC10 indica que o painel de indicadores é retornado ao visualizar o projeto em detalhes.
        return Response(serializer.data)
    

@extend_schema_view(
    list=extend_schema(
        summary="Listar tarefas",
        description="Retorna todas as tarefas dos projetos em que o usuário autenticado é o dono ou um participante.",
        responses={200: TarefaCreateSerializer(many=True)}
    ),
    create=extend_schema(
        summary="Criar uma nova tarefa",
        description="Cria uma tarefa vinculada a um projeto. Apenas o dono ou participantes do projeto podem criar tarefas.",
        request=TarefaCreateSerializer,
        responses={201: TarefaCreateSerializer, 403: None}
    ),
    retrieve=extend_schema(
        summary="Detalhar uma tarefa",
        description="Retorna os detalhes completos de uma tarefa específica baseada no ID.",
        responses={200: TarefaDetailSerializer, 404: None}
    ),
    update=extend_schema(
        summary="Atualizar completamente uma tarefa",
        description="Substitui todos os dados de uma tarefa existente.",
        request=TarefaUpdateSerializer,
        responses={200: TarefaUpdateSerializer}
    ),
    partial_update=extend_schema(
        summary="Atualizar parcialmente uma tarefa",
        description="Modifica apenas os campos enviados na requisição da tarefa.",
        request=TarefaUpdateSerializer,
        responses={200: TarefaUpdateSerializer}
    ),
    destroy=extend_schema(
        summary="Excluir uma tarefa",
        description="Remove permanentemente uma tarefa do sistema.",
        responses={204: None}
    )
)

class TarefaViewSet(viewsets.ModelViewSet):
    serializer_class = TarefaCreateSerializer
    permission_classes = [IsAuthenticated, IsDonoOuParticipanteDoProjeto]

        # Restringe a busca apenas para tarefas dos projetos do usuário
    def get_queryset(self):
            user = self.request.user
            return Tarefa.objects.filter(
                Q(projeto__dono=user) | Q(projeto__participantes=user)
            ).distinct()

    def perform_create(self, serializer):
        # Delega a criação da tarefa para a classe service
        task_service.TaskService.processar_criacao_tarefa(serializer, self.request.user)
        
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TarefaDetailSerializer
        if self.action in ['update', 'partial_update']:
            return TarefaUpdateSerializer
        return TarefaCreateSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'CONCLUIDA':
            instance.subtarefas.update(status='CONCLUIDA')
    
   
@extend_schema_view(
    list=extend_schema(
        summary="Listar subtarefas",
        description="Retorna todas as subtarefas vinculadas às tarefas dos projetos em que o usuário está envolvido.",
        responses={200: SubtarefaCreateSerializer(many=True)}
    ),
    create=extend_schema(
        summary="Criar uma nova subtarefa",
        description="Cria uma subtarefa atrelada a uma tarefa específica. O usuário precisa ser membro do projeto pai.",
        request=SubtarefaCreateSerializer,
        responses={201: SubtarefaCreateSerializer, 403: None}
    ),
    retrieve=extend_schema(
        summary="Detalhar uma subtarefa",
        description="Retorna os dados de uma subtarefa específica por ID.",
        responses={200: SubtarefaCreateSerializer}
    ),
    update=extend_schema(
        summary="Atualizar completamente uma subtarefa",
        description="Substitui os dados da subtarefa. Geralmente restringe a alteração da tarefa pai.",
        request=SubtarefaUpdateSerializer,
        responses={200: SubtarefaUpdateSerializer}
    ),
    partial_update=extend_schema(
        summary="Atualizar parcialmente uma subtarefa",
        description="Modifica apenas os campos enviados no corpo da requisição.",
        request=SubtarefaUpdateSerializer,
        responses={200: SubtarefaUpdateSerializer}
    ),
    destroy=extend_schema(
        summary="Excluir uma subtarefa",
        description="Remove permanentemente a subtarefa do sistema.",
        responses={204: None}
    )
)

class SubtarefaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsDonoOuParticipanteDoProjeto]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return SubtarefaUpdateSerializer
        return SubtarefaCreateSerializer

    def get_queryset(self):
        user = self.request.user
        return Subtarefa.objects.filter(
            Q(tarefa__projeto__dono=user) | Q(tarefa__projeto__participantes=user)
        ).distinct()

    def perform_create(self, serializer):
        # Delega a criação da subtarefa para a camada service
        task_service.TaskService.processar_criacao_subtarefa(serializer, self.request.user)
        
class AnexoViewSet(viewsets.ModelViewSet):
    serializer_class = AnexoSerializer
    permission_classes = [IsAuthenticated, IsDonoOuParticipanteDoProjeto]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        return Anexo.objects.filter(
            Q(tarefa__projeto__dono=user) | Q(tarefa__projeto__participantes=user)
        ).distinct()

    def perform_create(self, serializer):
        # Delega a verificação de regras para o TaskService
        task_service.TaskService.processar_anexo(serializer, self.request.user)





@extend_schema_view(
    list=extend_schema(
        summary="Listar comentários de tarefas",
        description="Retorna as mensagens e discussões de tarefas pertencentes aos projetos do usuário autenticado.",
        responses={200: ComentarioTarefaSerializer(many=True)}
    ),
    create=extend_schema(
        summary="Adicionar um comentário",
        description="Cria uma nova mensagem em uma tarefa específica. Permitido para donos e participantes do projeto.",
        request=ComentarioTarefaSerializer,
        responses={201: ComentarioTarefaSerializer, 403: None}
    ),
    retrieve=extend_schema(
        summary="Detalhar um comentário",
        description="Busca o conteúdo e metadados de um comentário específico pelo ID.",
        responses={200: ComentarioTarefaSerializer}
    ),
    update=extend_schema(
        summary="Atualizar completamente um comentário",
        description="Substitui o texto e dados de um comentário existente.",
        request=ComentarioTarefaSerializer,
        responses={200: ComentarioTarefaSerializer}
    ),
    partial_update=extend_schema(
        summary="Atualizar parcialmente um comentário",
        description="Edita campos específicos de um comentário (como corrigir apenas o texto da mensagem).",
        request=ComentarioTarefaSerializer,
        responses={200: ComentarioTarefaSerializer}
    ),
    destroy=extend_schema(
        summary="Excluir um comentário",
        description="Remove permanentemente o comentário do histórico da tarefa.",
        responses={204: None}
    )
)


class ComentarioTarefaViewSet(viewsets.ModelViewSet):
    serializer_class = ComentarioTarefaSerializer
    permission_classes = [IsAuthenticated, IsDonoOuParticipanteDoProjeto]

    def get_queryset(self):
        user = self.request.user
        return ComentarioTarefa.objects.filter(
            Q(tarefa__projeto__dono=user) | Q(tarefa__projeto__participantes=user)
        ).distinct()

    def perform_create(self, serializer):
        # Delega a verificação de regras para o TaskService
        task_service.TaskService.processar_comentario(serializer, self.request.user)