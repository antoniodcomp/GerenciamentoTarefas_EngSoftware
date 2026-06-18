from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Tornamos o email obrigatório e único no sistema
    email = models.EmailField(unique=True)

    # Definimos que o email será o campo de login (substituindo o username)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # Mantido apenas por exigência do Django base

    def __str__(self):
        return self.email