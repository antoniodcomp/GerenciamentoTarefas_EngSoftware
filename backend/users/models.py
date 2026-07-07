from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone                                                                                                                                 
from datetime import timedelta  
import random                   

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
    
    
    cargo_profissional = models.CharField(max_length=255)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default=COMUM)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'Usuario'

    def __str__(self):
        return f"{self.nome} ({self.email})"
    

class CodigoRecuperacao(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='codigos_recuperacao')                                                            
    codigo = models.CharField(max_length=6)                                                                                                                       
    criado_em = models.DateTimeField(auto_now_add=True)                                                                                                           
    usado = models.BooleanField(default=False) 

    def is_valid(self):
        return (not self.usado) and (timezone.now() < self.criado_em + timedelta(minutes=10))
    
    @classmethod
    def gerar_codigo(cls, usuario):
        cls.objects.filter(usuario=usuario, usado=False).update(usado=True)
        codigo = f'{random.randint(100000, 999999)}'
        return cls.objects.create(usuario=usuario, codigo=codigo)
