from django.db import models
from django.db.models import Q, F
from django.conf import settings

class Projeto(models.Model):
    nome = models.CharField(max_length=255, help_text="O nome ou título do projeto. Deve ser claro e descritivo.")
    descricao = models.TextField(blank=True, null=True, help_text="Uma descrição detalhada sobre os objetivos e escopo do projeto.") 
    data_inicio = models.DateTimeField(blank=True, null=True, help_text="Data e hora em que o projeto está planejado para começar.")
    data_fim = models.DateTimeField(blank=True, null=True, help_text="Prazo final (deadline) planejado para a conclusão do projeto.")
    dono = models.ForeignKey(  
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projetos_proprios',
        null=True,
        blank=True,
        help_text="O usuário criador e gestor principal do projeto."
    )
    criado_em = models.DateTimeField(auto_now_add=True, null=True, blank=True, help_text="Data e hora em que o registro do projeto foi criado no sistema (gerado automaticamente).") 
    participantes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='projetos_participando',
        help_text="Lista de usuários convidados que também colaboram neste projeto."
    )

    class Meta:
        db_table = 'Projeto' 
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

    nome = models.CharField(max_length=255, help_text="O título ou nome curto da tarefa.")
    descricao = models.CharField(max_length=255, blank=True, null=True, help_text="Um breve resumo ou detalhamento das ações desta tarefa.")
    data_inicio = models.DateTimeField(blank=True, null=True, help_text="Data e hora previstas para o início da execução da tarefa.")
    data_fim = models.DateTimeField(blank=True, null=True, help_text="Prazo final (deadline) limite para que a tarefa seja concluída.")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDENTE, help_text="Estado atual do progresso da tarefa.")
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='tarefas', help_text="O projeto pai ao qual esta tarefa está vinculada.")
    participantes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='tarefas_participando',
        help_text="Os usuários designados para trabalhar e executar esta tarefa."
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

    nome = models.CharField(max_length=255, help_text="O título ou nome descritivo da subtarefa.")
    descricao = models.CharField(max_length=255, blank=True, null=True, help_text="O detalhamento prático do que deve ser feito nesta subtarefa.")
    data_inicio = models.DateTimeField(blank=True, null=True, help_text="Data prevista para o início da execução da subtarefa.")
    data_fim = models.DateTimeField(blank=True, null=True, help_text="Prazo final limite para a conclusão da subtarefa.")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDENTE, help_text="Estado atual do progresso da subtarefa.")
    tarefa = models.ForeignKey(Tarefa, on_delete=models.CASCADE, related_name='subtarefas', help_text="A tarefa pai à qual esta subtarefa pertence.")
    participantes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='subtarefas_participando',
        help_text="Os usuários designados especificamente para cumprir esta subtarefa."
    )

    class Meta:
        db_table = 'Subtarefa'
        constraints = [
            models.CheckConstraint(
                condition=Q(data_fim__gte=F('data_inicio')) | Q(data_inicio__isnull=True) | Q(data_fim__isnull=True),
                name='%(class)s_data_fim_maior_ou_igual_inicio'
            )
        ]

    def __str__(self):
        return f"{self.nome} ({self.status})"


class Anexo(models.Model):
    nome_arquivo = models.CharField(max_length=255, blank=True, null=True, help_text="O nome original do arquivo salvo.")
    caminho_arquivo = models.FileField(upload_to='anexos/', help_text="O arquivo físico enviado.")
    data_hora_upload = models.DateTimeField(auto_now_add=True, help_text="Data e hora em que o upload foi realizado.")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='anexos', help_text="O usuário que realizou o upload do anexo.")
    tarefa = models.ForeignKey(Tarefa, on_delete=models.CASCADE, related_name='anexos', help_text="A tarefa pai à qual este arquivo está anexado.")

    class Meta:
        db_table = 'Anexo'

    def __str__(self):
        return f"{self.nome_arquivo or 'Anexo'}"


class ComentarioTarefa(models.Model):
    texto = models.CharField(max_length=255, help_text="O conteúdo de texto do comentário inserido pelo usuário.")
    data = models.DateTimeField(auto_now_add=True, help_text="Data e hora em que o comentário foi enviado.")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comentarios_tarefas', help_text="O usuário autor do comentário.")
    tarefa = models.ForeignKey(Tarefa, on_delete=models.CASCADE, related_name='comentarios', help_text="A tarefa pai à qual este comentário está associado.")

    class Meta:
        db_table = 'ComentarioTarefa'

    def __str__(self):
        return f"Comentário de {self.usuario} na Tarefa {self.tarefa_id}"
    

class ComentarioSubtarefa(models.Model):
    texto = models.CharField(max_length=255, help_text="O conteúdo de texto do comentário inserido pelo usuário.")
    data = models.DateTimeField(auto_now_add=True, help_text="Data e hora em que o comentário foi enviado.")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comentarios_subtarefas',  help_text="O usuário autor do comentário.")
    subtarefa = models.ForeignKey(Subtarefa, on_delete=models.CASCADE, related_name='comentarios', help_text="A Subtarefa pai à qual este comentário está associado.")

    class Meta:
        db_table = 'ComentarioSubtarefa'

    def __str__(self):
        return f"Comentário de {self.usuario} na Subtarefa {self.subtarefa_id}"