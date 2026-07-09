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
        projeto = serializer.validated_data.get('projeto')

        if projeto.dono != self.request.user and self.request.user not in projeto.participantes.all():
            raise PermissionDenied("Você não tem perfil/permissão de Gestor neste projeto.")

        tarefa = serializer.save()


        responsaveis = list(projeto.participantes.all())
        if projeto.dono not in responsaveis:
            responsaveis.append(projeto.dono)

        for responsavel in responsaveis:
            if responsavel != self.request.user:
                    
                    
                    """
                    
                       
            
                    )
                    """
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TarefaDetailSerializer
        if self.action in ['update', 'partial_update']:
            return TarefaUpdateSerializer
        return TarefaCreateSerializer
    
   
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
        tarefa = serializer.validated_data.get('tarefa')
        projeto = tarefa.projeto

        if projeto.dono != self.request.user and self.request.user not in projeto.participantes.all():
            raise PermissionDenied("Você não tem permissão para criar subtarefas nesta tarefa.")

        subtarefa = serializer.save()

           
        responsaveis = list(projeto.participantes.all())
        if projeto.dono not in responsaveis:
            responsaveis.append(projeto.dono)

        for responsavel in responsaveis:
            if responsavel != self.request.user:
                print(f"[NOTIFICAÇÃO] Para {responsavel.username}: Nova subtarefa '{subtarefa.nome}' criada na tarefa '{tarefa.nome}' do projeto'{projeto.nome}'")


@extend_schema_view(
    list=extend_schema(
        summary="Listar anexos",
        description="Retorna todos os anexos das tarefas nos projetos em que o usuário está envolvido.",
        responses={200: AnexoSerializer(many=True)}
    ),
    create=extend_schema(
        summary="Fazer upload de um anexo",
        description="Envia um arquivo para ser anexado a uma tarefa específica. Requer formato multipart/form-data.",
        request=AnexoSerializer,
        responses={201: AnexoSerializer, 403: None}
    ),
    retrieve=extend_schema(
        summary="Detalhar um anexo",
        description="Retorna as informações de registro de um anexo específico através do ID.",
        responses={200: AnexoSerializer}
    ),
    update=extend_schema(
        summary="Atualizar completamente um anexo",
        description="Substitui o arquivo ou os dados do anexo existente.",
        request=AnexoSerializer,
        responses={200: AnexoSerializer}
    ),
    partial_update=extend_schema(
        summary="Atualizar parcialmente um anexo",
        description="Modifica campos específicos do anexo (como alterar apenas o nome ou reordenar).",
        request=AnexoSerializer,
        responses={200: AnexoSerializer}
    ),
    destroy=extend_schema(
        summary="Excluir um anexo",
        description="Remove permanentemente o arquivo e o registro do anexo do sistema.",
        responses={204: None}
    )
)


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
        
        
        if projeto.dono != self.request.user and self.request.user not in projeto.participantes.all():
            raise PermissionDenied("Você não tem permissão para anexar arquivos nesta tarefa.")
            
        serializer.save(usuario=self.request.user)





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
        tarefa = serializer.validated_data.get('tarefa')
        projeto = tarefa.projeto
        
        # RF22 / UC24: Permissão de Comentário (Gestores e Usuários Comuns podem comentar)
        if projeto.dono != self.request.user and self.request.user not in projeto.participantes.all():
            raise PermissionDenied("Você não tem permissão para comentar nesta tarefa.")
            
        serializer.save(usuario=self.request.user)