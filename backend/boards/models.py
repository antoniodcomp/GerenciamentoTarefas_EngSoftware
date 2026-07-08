from django.db import models
from django.db.models import Q, F
from django.conf import settings

class Projeto(models.Model):
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True) 
    data_inicio = models.DateTimeField(blank=True, null=True)
    data_fim = models.DateTimeField(blank=True, null=True)
    dono = models.ForeignKey(  
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projetos_proprios',
        null=True,
        blank=True
    )
    criado_em = models.DateTimeField(auto_now_add=True, null=True, blank=True) 
    participantes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='projetos_participando'
    )

    class Meta:
        db_table = 'Projeto' # <-- Correto para Projeto
        constraints = [
            models.CheckConstraint(
                condition=Q(data_fim__gte=F('data_inicio')) | Q(data_inicio__isnull=True) | Q(data_fim__isnull=True),
                name='%(class)s_data_fim_maior_ou_igual_inicio'
            )
        ]
    def __str__(self):
        return self.nome


class Tarefa(models.Model):
    PENDENTE = 'PENDENTE'
    EM_ANDAMENTO = 'EM_ANDAMENTO'
    CONCLUIDA = 'CONCLUIDA'
    STATUS_CHOICES = [
        (PENDENTE, 'Pendente'),
        (EM_ANDAMENTO, 'Em Andamento'),
        (CONCLUIDA, 'Concluída'),
    ]

    nome = models.CharField(max_length=255)
    descricao = models.CharField(max_length=255, blank=True, null=True)
    data_inicio = models.DateTimeField(blank=True, null=True)
    data_fim = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDENTE)
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='tarefas')
    participantes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='tarefas_participando'
    )

    class Meta:
        db_table = 'Tarefa' # <-- Mude aqui para 'Tarefa'
        constraints = [
            models.CheckConstraint(
                condition=Q(data_fim__gte=F('data_inicio')) | Q(data_inicio__isnull=True) | Q(data_fim__isnull=True),
                name='%(class)s_data_fim_maior_ou_igual_inicio'
            )
        ]

    def __str__(self):
        return f"{self.nome} ({self.status})"


class Subtarefa(models.Model):
    PENDENTE = 'PENDENTE'
    EM_ANDAMENTO = 'EM_ANDAMENTO'
    CONCLUIDA = 'CONCLUIDA'
    STATUS_CHOICES = [
        (PENDENTE, 'Pendente'),
        (EM_ANDAMENTO, 'Em Andamento'),
        (CONCLUIDA, 'Concluída'),
    ]

    nome = models.CharField(max_length=255)
    descricao = models.CharField(max_length=255, blank=True, null=True)
    data_inicio = models.DateTimeField(blank=True, null=True)
    data_fim = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDENTE)
    tarefa = models.ForeignKey(Tarefa, on_delete=models.CASCADE, related_name='subtarefas')
    participantes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='subtarefas_participando'
    )

    class Meta:
        db_table = 'Subtarefa' # <-- Mude aqui para 'Subtarefa'
        constraints = [
            models.CheckConstraint(
                condition=Q(data_fim__gte=F('data_inicio')) | Q(data_inicio__isnull=True) | Q(data_fim__isnull=True),
                name='%(class)s_data_fim_maior_ou_igual_inicio'
            )
        ]

    def __str__(self):
        return f"{self.nome} ({self.status})"


class Anexo(models.Model):
    nome_arquivo = models.CharField(max_length=255, blank=True, null=True)
    caminho_arquivo = models.FileField(upload_to='anexos/')
    data_hora_upload = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='anexos')
    tarefa = models.ForeignKey(Tarefa, on_delete=models.CASCADE, related_name='anexos')

    class Meta:
        db_table = 'Anexo'

    def __str__(self):
        return f"{self.nomeArquivo or 'Anexo'}"


class ComentarioTarefa(models.Model):
    texto = models.CharField(max_length=255)
    data = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comentarios_tarefas')
    tarefa = models.ForeignKey(Tarefa, on_delete=models.CASCADE, related_name='comentarios')

    class Meta:
        db_table = 'ComentarioTarefa'

    def __str__(self):
        return f"Comentário de {self.usuario} na Tarefa {self.tarefa_id}"
    

class ComentarioSubtarefa(models.Model):
    texto = models.CharField(max_length=255)
    data = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comentarios_subtarefas')
    subtarefa = models.ForeignKey(Subtarefa, on_delete=models.CASCADE, related_name='comentarios')

    class Meta:
        db_table = 'ComentarioSubtarefa'

    def __str__(self):
        return f"Comentário de {self.usuario} na Subtarefa {self.subtarefa_id}"