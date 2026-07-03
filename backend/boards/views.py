from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Projeto
from .serializers import ProjectSerializer
from django.db.models import Q

class ProjectViewSet(viewsets.ModelViewSet):
    # queryset = Projeto.objects.all().order_by('-criado_em')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

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
    
    # def get_queryset(self):
    #     user = self.request.user
  
    #     # LOGS DE DIAGNÓSTICO
    #     print("\n" + "="*50)
    #     print(f"[DEBUG API] Usuário que fez a requisição: {user}")
    #     print(f"[DEBUG API] Está autenticado? {user.is_authenticated}")
    #     if user.is_authenticated:
    #         print(f"[DEBUG API] ID do Usuário: {user.id} | E-mail: {user.email}")
  
    #     # Lista todos os projetos no banco para ver quem é o dono e quem são os participantes salvos
    #     todos_projetos = Projeto.objects.all()
    #     print(f"[DEBUG API] Total de projetos no banco: {todos_projetos.count()}")
    #     for p in todos_projetos:
    #         participantes_ids = list(p.participantes.values_list('id', flat=True))
    #         print(f" -> Projeto ID: {p.id} | Nome: {p.nome} | Dono ID: {p.dono_id} | Participantes IDs: {participantes_ids}")
    #     print("="*50 + "\n")
  
    #     if not user.is_authenticated:
    #         return Projeto.objects.none()
  
    #     return Projeto.objects.filter(
    #         Q(dono=user) | Q(participantes=user)
    #     ).distinct().order_by('-criado_em')

