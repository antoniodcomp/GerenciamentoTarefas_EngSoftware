from rest_framework import permissions
from .models import Projeto, Tarefa, Subtarefa, Anexo, ComentarioTarefa

class IsDonoOuParticipanteDoProjeto(permissions.BasePermission):
        """
        Classe de autorização baseada em objeto. Garante que a 
        operação só seja executada se o usuário logado for o 
        proprietário do projeto ou um participante.
        """

        def has_object_permission(self, request, view, obj):
                # Proteção contra requisições não autenticadas
                if not request.user or not request.user.is_authenticated:
                        return False
                
                # Inicializando a variável que guardará a instância raiz do Projeto
                projeto = None

                # Resolvendo o tipo do objeto e armazenando o Projeto
                if isinstance(obj, Projeto):
                        projeto = obj
                elif isinstance(obj, Tarefa):
                        projeto = obj.projeto
                elif isinstance(obj, (Subtarefa, Anexo, ComentarioTarefa)):
                        projeto = obj.tarefa.projeto

                # Fallback caso o projeto não seja mapeado
                if not projeto:
                        return False
                
                # Verificando se o usuário é o dono do Projeto
                is_dono = (request.user == projeto.dono)
                # Verificando se o usuário é um participante do Projeto
                is_participante = projeto.participantes.filter(id=request.user.id).exists()

                return is_dono or is_participante