from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

# Registra o seu usuário customizado usando o visual padrão bonito do Django
admin.site.register(Usuario, UserAdmin)