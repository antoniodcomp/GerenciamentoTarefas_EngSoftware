from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ADMINISTRADOR = 'ADMINISTRADOR'
    GESTOR = 'GESTOR'
    COMUM = 'COMUM'
    TIPO_CHOICES = [
        (ADMINISTRADOR, 'Administrador'),
        (GESTOR, 'Gestor'),
        (COMUM, 'Comum'),
    ]

    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    cargoProfissional = models.CharField(max_length=255)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default=COMUM)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'Usuario'

    def __str__(self):
        return f"{self.nome} ({self.email})"
