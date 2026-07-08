from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Projeto, Tarefa, Subtarefa, Anexo, ComentarioTarefa
from .serializers import ProjetoSerializer, ProjetoDashboardSerializer, TarefaCreateSerializer, SubtarefaCreateSerializer, TarefaDetailSerializer, AnexoSerializer, ComentarioTarefaSerializer, TarefaUpdateSerializer, SubtarefaUpdateSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from .permissions import IsDonoOuParticipanteDoProjeto

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
        tarefas = projeto.tarefas.all()
        
        # Cálculo de Indicadores (UC14)
        total_tasks = tarefas.count()
        pending_tasks = tarefas.filter(status=Tarefa.PENDENTE).count()
        in_progress_tasks = tarefas.filter(status=Tarefa.EM_ANDAMENTO).count()
        completed_tasks = tarefas.filter(status=Tarefa.CONCLUIDA).count()
        
        # Progresso Geral (UC14)
        progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Tarefas Atrasadas (RF59) - Não estão concluídas e o prazo já passou
        now = timezone.now()
        delayed_tasks = tarefas.exclude(status=Tarefa.CONCLUIDA).filter(data_fim__lt=now)
        
        # Anexando as métricas no objeto do projeto (em memória, sem salvar no banco)
        projeto.total_tasks = total_tasks
        projeto.pending_tasks = pending_tasks
        projeto.in_progress_tasks = in_progress_tasks
        projeto.completed_tasks = completed_tasks
        projeto.progress_percentage = round(progress_percentage, 2)
        projeto.delayed_tasks = delayed_tasks
        
        # Serializa com o serializer de dashboard
        serializer = ProjetoDashboardSerializer(projeto)
        
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
        projeto = serializer.validated_data.get('projeto')

            # 1. RF15 (Permissão de Cadastro): Valida se quem está criando é dono ou gestor
        if projeto.dono != self.request.user and self.request.user not in projeto.participantes.all():
            raise PermissionDenied("Você não tem perfil/permissão de Gestor neste projeto.")

            # 2. Salva a tarefa (o Model garantirá o RF18 definindo o status para Pendente)
        tarefa = serializer.save()

            # 3. RF41 (Notificações): Gerar notificação para outros gestores
            # Coleta quem precisa ser avisado (Dono + Participantes, excluindo quem acabou de criar a tarefa)
        responsaveis = list(projeto.participantes.all())
        if projeto.dono not in responsaveis:
            responsaveis.append(projeto.dono)

        for responsavel in responsaveis:
            if responsavel != self.request.user:
                    # Aqui você grava na tabela de notificações ou dispara um Email.
                    # Exemplo hipotético se você tiver um model de Notificação:
                    """
                    Notificacao.objects.create(
                        usuario=responsavel,
                        titulo=f"Nova Tarefa no Projeto {projeto.nome}",
                        mensagem=f"O gestor {self.request.user.username} criou a tarefa '{tarefa.nome}'",
                        tarefa_id=tarefa.id
                    )
                    """
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
        tarefa = serializer.validated_data.get('tarefa')
        projeto = tarefa.projeto

            # RF27 / Permissão: Verifica permissão (mesma regra da tarefa)
        if projeto.dono != self.request.user and self.request.user not in projeto.participantes.all():
            raise PermissionDenied("Você não tem permissão para criar subtarefas nesta tarefa.")

        subtarefa = serializer.save()

            # RF42: Notificações
        responsaveis = list(projeto.participantes.all())
        if projeto.dono not in responsaveis:
            responsaveis.append(projeto.dono)

        for responsavel in responsaveis:
            if responsavel != self.request.user:
                print(f"[NOTIFICAÇÃO] Para {responsavel.username}: Nova subtarefa '{subtarefa.nome}' criada na tarefa '{tarefa.nome}' do projeto'{projeto.nome}'")

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
        tarefa = serializer.validated_data.get('tarefa')
        projeto = tarefa.projeto
        
        # RF21: Permissão de Anexo (Gestores e Usuários Comuns podem anexar arquivos)
        if projeto.dono != self.request.user and self.request.user not in projeto.participantes.all():
            raise PermissionDenied("Você não tem permissão para anexar arquivos nesta tarefa.")
            
        serializer.save(usuario=self.request.user)

class ComentarioTarefaViewSet(viewsets.ModelViewSet):
    serializer_class = ComentarioTarefaSerializer
    permission_classes = [IsAuthenticated, IsDonoOuParticipanteDoProjeto]

    def get_queryset(self):
        user = self.request.user
        return ComentarioTarefa.objects.filter(
            Q(tarefa__projeto__dono=user) | Q(tarefa__projeto__participantes=user)
        ).distinct()

    def perform_create(self, serializer):
        tarefa = serializer.validated_data.get('tarefa')
        projeto = tarefa.projeto
        
        # RF22 / UC24: Permissão de Comentário (Gestores e Usuários Comuns podem comentar)
        if projeto.dono != self.request.user and self.request.user not in projeto.participantes.all():
            raise PermissionDenied("Você não tem permissão para comentar nesta tarefa.")
            
        serializer.save(usuario=self.request.user)