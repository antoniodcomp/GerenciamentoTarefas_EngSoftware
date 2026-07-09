from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from boards.models import Projeto, Tarefa, Subtarefa
from datetime import date, timedelta

User = get_user_model()

class ProjectTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='gestor',
            email='gestor@test.com',
            nome='Gestor',
            password='testpassword123',
            tipo='GESTOR'
        )
        self.user_comum = User.objects.create_user(
            username='comum',
            email='comum@test.com',
            nome='Comum',
            password='testpassword123',
            tipo='COMUM'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_project(self):
        data = {
            'name': 'Test Project',
            'description': 'A description',
            'startline': date.today().isoformat(),
            'deadline': (date.today() + timedelta(days=7)).isoformat()
        }
        response = self.client.post('/api/projects/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Projeto.objects.count(), 1)
        self.assertEqual(Projeto.objects.get().nome, 'Test Project')
        self.assertEqual(Projeto.objects.get().dono, self.user)

    def test_edit_project_gestor(self):
        project = Projeto.objects.create(
            nome='Old Name', 
            dono=self.user,
            data_inicio=date.today(),
            data_fim=date.today() + timedelta(days=7)
        )
        data = {
            'name': 'New Name',
            'startline': project.data_inicio.isoformat(),
            'deadline': project.data_fim.isoformat()
        }
        response = self.client.put(f'/api/projects/{project.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.nome, 'New Name')

    def test_edit_project_comum_denied(self):
        project = Projeto.objects.create(
            nome='Old Name', 
            dono=self.user,
            data_inicio=date.today(),
            data_fim=date.today() + timedelta(days=7)
        )
        project.participantes.add(self.user_comum)
        
        self.client.force_authenticate(user=self.user_comum)
        data = {
            'name': 'New Name',
            'startline': project.data_inicio.isoformat(),
            'deadline': project.data_fim.isoformat()
        }
        response = self.client.put(f'/api/projects/{project.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class TaskTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='gestor2',
            email='gestor2@test.com',
            nome='Gestor2',
            password='testpassword123',
            tipo='GESTOR'
        )
        self.client.force_authenticate(user=self.user)
        self.project = Projeto.objects.create(
            nome='Project Tasks', 
            dono=self.user,
            data_inicio=date.today(),
            data_fim=date.today() + timedelta(days=7)
        )

    def test_cascade_task_completion(self):
        task = Tarefa.objects.create(
            nome='Main Task',
            projeto=self.project,
            data_fim=date.today() + timedelta(days=7)
        )
        sub1 = Subtarefa.objects.create(tarefa=task, nome='Sub 1', status='PENDENTE')
        sub2 = Subtarefa.objects.create(tarefa=task, nome='Sub 2', status='EM_ANDAMENTO')

        # Concluir a tarefa pai
        response = self.client.patch(f'/api/tasks/{task.id}/', {'status': 'CONCLUIDA'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar as subtarefas
        sub1.refresh_from_db()
        sub2.refresh_from_db()
        self.assertEqual(sub1.status, 'CONCLUIDA')
        self.assertEqual(sub2.status, 'CONCLUIDA')
