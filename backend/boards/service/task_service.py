from rest_framework.exceptions import PermissionDenied

class TaskService:
    @staticmethod
    def validar_permissao_gestor(projeto, usuario, acao_msg):
        # RF15 (Permissão de Cadastro): Valida se quem está criando é dono ou gestor
        if projeto.dono != usuario and usuario not in projeto.participantes.all():
            raise PermissionDenied(f"Você não tem permissão para {acao_msg}")
        
    @classmethod
    def processar_criacao_tarefa(cls, serializer, usuario):
        projeto = serializer.validated_data.get('projeto')
        cls.validar_permissao_gestor(projeto, usuario, "criar tarefas neste projeto")
        # Salva a tarefa (o Model garantirá o RF18 definindo o status para Pendente)
        serializer.save()

    @classmethod
    def processar_criacao_subtarefa(cls, serializer, usuario):
        tarefa = serializer.validated_data.get('tarefa')
        projeto = tarefa.projeto
        cls.validar_permissao_gestor(projeto, usuario, "criar subtarefas nesta tarefa")
        serializer.save()

    @classmethod
    def processar_anexo(cls, serializer, usuario):
        # RF21: Permissão de Anexo (Gestores e Usuários Comuns podem anexar arquivos)
        tarefa = serializer.validated_data.get('tarefa')
        cls.validar_permissao_gestor(tarefa.projeto, usuario, "anexar arquivos nesta tarefa")
        serializer.save(usuario=usuario)

    @classmethod
    def processar_comentario(cls, serializer, usuario):
        tarefa = serializer.validated_data.get('tarefa')
        cls.validar_permissao_gestor(tarefa.projeto, usuario, "comentar nesta tarefa")
        serializer.save(usuario=usuario)