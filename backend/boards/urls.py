from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjetoViewSet, TarefaViewSet, SubtarefaViewSet, AnexoViewSet, ComentarioTarefaViewSet

router = DefaultRouter()
router.register(r'projects', ProjetoViewSet, basename='project')
router.register(r'tasks', TarefaViewSet, basename='task')
router.register(r'subtasks', SubtarefaViewSet, basename='subtask')
router.register(r'attachments', AnexoViewSet, basename='attachment')
router.register(r'comments', ComentarioTarefaViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]
