from django.utils import timezone
from ..models import Tarefa

class ProjetoService:
    
    @staticmethod
    def preparar_dados_dashboard(projeto):
        """
        Executa os cálculos de negócio e anexas os resultados
        ao objeto em memória
        """
        tarefas = projeto.tarefas.all()

        # Cálculo de Indicadores (UC14)
        total_tasks = tarefas.count()
        pending_tasks = tarefas.filter(status=Tarefa.PENDENTE).count()
        in_progress_tasks = tarefas.filter(status=Tarefa.EM_ANDAMENTO).count()
        completed_tasks = tarefas.filter(status=Tarefa.CONCLUIDA).count()
        
        # Progresso Geral (UC14)
        progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Tarefas Atrasadas (RF59) - Não estão concluídas e o prazo já passou
        now = timezone.now()
        delayed_tasks = tarefas.exclude(status=Tarefa.CONCLUIDA).filter(data_fim__lt=now)
        
        # Anexando as métricas no objeto do projeto (em memória, sem salvar no banco)
        projeto.total_tasks = total_tasks
        projeto.pending_tasks = pending_tasks
        projeto.in_progress_tasks = in_progress_tasks
        projeto.completed_tasks = completed_tasks
        projeto.progress_percentage = round(progress_percentage, 2)
        projeto.delayed_tasks = delayed_tasks

        return projeto