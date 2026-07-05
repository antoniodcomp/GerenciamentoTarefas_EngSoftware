from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, SubtaskViewSet, AnexoViewSet, ComentarioTarefaViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'subtasks', SubtaskViewSet, basename='subtask')
router.register(r'attachments', AnexoViewSet, basename='attachment')
router.register(r'comments', ComentarioTarefaViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]
