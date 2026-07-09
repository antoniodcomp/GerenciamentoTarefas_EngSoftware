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