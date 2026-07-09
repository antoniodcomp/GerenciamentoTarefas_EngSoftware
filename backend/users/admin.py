from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

class CustomUserAdmin(UserAdmin):
    # Exibe os campos customizados no formulário de edição do usuário
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Customizadas', {'fields': ('nome', 'cargo_profissional', 'tipo')}),
    )
    # Exibe os campos customizados no formulário de criação de um novo usuário pelo admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informações Customizadas', {'fields': ('nome', 'cargo_profissional', 'tipo')}),
    )
    # Define quais colunas serão mostradas na lista de usuários no admin
    list_display = ('username', 'email', 'nome', 'tipo', 'is_staff')

# Registra usando a nova classe personalizada
admin.site.register(Usuario, CustomUserAdmin)