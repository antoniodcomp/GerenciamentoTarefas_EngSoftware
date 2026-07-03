from django.contrib import admin
from .models import Projeto, Tarefa, Subtarefa, Anexo, ComentarioTarefa, ComentarioSubtarefa


class ProjetoAdmin(admin.ModelAdmin):
    # Divide a seleção em duas caixas: Disponíveis vs Escolhidos
    filter_horizontal = ('participantes',)
    list_display = ('nome', 'dono', 'criado_em')

class TarefaAdmin(admin.ModelAdmin):
    filter_horizontal = ('participantes',)
    list_display = ('nome', 'projeto', 'status')

class SubtarefaAdmin(admin.ModelAdmin):
    filter_horizontal = ('participantes',)
    list_display = ('nome', 'tarefa', 'status')


admin.site.register(Projeto, ProjetoAdmin)
admin.site.register(Tarefa, TarefaAdmin)
admin.site.register(Subtarefa, SubtarefaAdmin)
admin.site.register(Anexo)
admin.site.register(ComentarioTarefa)
admin.site.register(ComentarioSubtarefa)
