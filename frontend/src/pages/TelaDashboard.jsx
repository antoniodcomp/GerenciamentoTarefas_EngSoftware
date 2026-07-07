import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDashboard } from '../services/projectService';
import { createProjectTarefa, updateTaskStatus } from '../services/taskService';

function TelaDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para nova tarefa (UC15)
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getProjectDashboard(id);
        setData(res);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar o dashboard do projeto. Certifique-se de que o backend está rodando.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) { setTaskError('O título da tarefa é obrigatório.'); return; }
    if (!taskDeadline) { setTaskError('O prazo é obrigatório.'); return; }

    try {
      setTaskLoading(true);
      setTaskError('');
      await createProjectTarefa({
        name: taskName.trim(),
        description: taskDesc.trim(),
        deadline: taskDeadline,
        project: id
      });
      // Recarregar os dados do dashboard após o cadastro
      const res = await getProjectDashboard(id);
      setData(res);
      // Limpar formulário
      setTaskName('');
      setTaskDesc('');
      setTaskDeadline('');
    } catch (err) {
      if (err.response && err.response.data) {
          const backendErrors = err.response.data;
          if (typeof backendErrors === 'object') {
            const messages = Object.entries(backendErrors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
              .join(' | ');
            setTaskError(messages || 'Erro ao criar tarefa. Verifique os dados.');
          }
      } else {
          setTaskError('Erro ao criar tarefa. Tente novamente.');
      }
    } finally {
      setTaskLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus, e) => {
    e.stopPropagation(); // Previne o redirecionamento ao clicar no select
    try {
      await updateTaskStatus(taskId, newStatus);
      // Recarrega o dashboard para atualizar as estatísticas e a barra de progresso
      const res = await getProjectDashboard(id);
      setData(res);
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Erro ao atualizar status da tarefa');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString('pt-BR');
  };

  const getTaskBadgeStyle = (status) => {
    let bgColor = '#3b82f6';
    if (status === 'PENDENTE') bgColor = '#f59e0b';
    if (status === 'CONCLUIDA') bgColor = '#10b981';
    
    return {
      marginLeft: '10px',
      fontSize: '12px',
      padding: '4px 10px',
      borderRadius: '12px',
      backgroundColor: bgColor,
      color: '#fff',
      fontWeight: 'bold'
    };
  };

  if (loading) {
    return <div style={styles.message}>Carregando painel do projeto...</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate('/projetos')} style={styles.backBtn}>Voltar para Projetos</button>
        <div style={{ ...styles.message, ...styles.error }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <button onClick={() => navigate('/projetos')} style={styles.backBtn}>← Voltar</button>
          <h1 style={styles.title}>{data.name}</h1>
          <p style={styles.desc}>{data.description || 'Sem descrição informada.'}</p>
        </div>
      </header>

      {/* Seção de Indicadores */}
      <section style={styles.statsSection}>
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Total de Tarefas</h4>
          <p style={styles.number}>{data.total_tasks}</p>
        </div>
        <div style={{ ...styles.card, borderColor: '#3b82f6' }}>
          <h4 style={{ ...styles.cardTitle, color: '#3b82f6' }}>Pendentes</h4>
          <p style={{ ...styles.number, color: '#3b82f6' }}>{data.pending_tasks}</p>
        </div>
        <div style={{ ...styles.card, borderColor: '#f59e0b' }}>
          <h4 style={{ ...styles.cardTitle, color: '#f59e0b' }}>Em Andamento</h4>
          <p style={{ ...styles.number, color: '#f59e0b' }}>{data.in_progress_tasks}</p>
        </div>
        <div style={{ ...styles.card, borderColor: '#10b981' }}>
          <h4 style={{ ...styles.cardTitle, color: '#10b981' }}>Concluídas</h4>
          <p style={{ ...styles.number, color: '#10b981' }}>{data.completed_tasks}</p>
        </div>
      </section>

      {/* Progresso do Projeto */}
      <section style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <h3 style={{ margin: 0 }}>Progresso do Projeto</h3>
          <span>{data.progress_percentage}%</span>
        </div>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBarFill, width: `${data.progress_percentage}%` }}></div>
        </div>
        <div style={styles.datesRow}>
          <span>Início: {formatDate(data.start_date)}</span>
          <span>Prazo: {formatDate(data.deadline)}</span>
        </div>
      </section>

      {/* Tarefas Atrasadas */}
      <section style={styles.delayedSection}>
        <h3 style={{ marginTop: 0 }}>⚠️ Tarefas Atrasadas</h3>
        {data.delayed_tasks && data.delayed_tasks.length > 0 ? (
          <div style={styles.taskList}>
            {data.delayed_tasks.map(task => (
              <div 
                key={task.id} 
                style={{ ...styles.taskCard, cursor: 'pointer' }}
                onClick={() => navigate(`/projetos/${id}/tarefas/${task.id}`)}
                title="Clique para ver os detalhes da tarefa"
              >
                <div>
                  <strong>{task.name}</strong>
                  <select 
                    value={task.status} 
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value, e)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ ...styles.taskStatus, border: 'none', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                    <option value="CONCLUIDA">CONCLUÍDA</option>
                  </select>
                </div>
                <div style={{ color: '#ef4444' }}>
                  Prazo: {formatDate(task.deadline)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#10b981', fontWeight: '500', margin: 0 }}>
            Excelente! Não há tarefas atrasadas para este projeto.
          </p>
        )}
      </section>

      {/* Lista de Todas as Tarefas */}
      <section style={styles.allTasksSection}>
        <h3>📋 Todas as Tarefas</h3>
        {data.all_tasks && data.all_tasks.length > 0 ? (
          <div style={styles.taskList}>
            {data.all_tasks.map(task => (
              <div 
                key={task.id} 
                style={{ ...styles.taskCard, backgroundColor: 'var(--bg)', cursor: 'pointer' }}
                onClick={() => navigate(`/projetos/${id}/tarefas/${task.id}`)}
                title="Clique para ver os detalhes da tarefa"
              >
                <div>
                  <strong>{task.name}</strong>
                  <select 
                    value={task.status} 
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value, e)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ ...getTaskBadgeStyle(task.status), border: 'none', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                    <option value="CONCLUIDA">CONCLUÍDA</option>
                  </select>
                </div>
                <div style={{ color: 'var(--text)', fontSize: '14px' }}>
                  Prazo: {formatDate(task.deadline)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text)' }}>Nenhuma tarefa cadastrada neste projeto ainda.</p>
        )}
      </section>

      {/* Seção de Criação de Tarefa (UC15) */}
      <section style={styles.newTaskSection}>
        <h3>Nova Tarefa</h3>
        <form onSubmit={handleCreateTask} style={styles.form}>
          {taskError && <div style={styles.errorMessage}>{taskError}</div>}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Título da Tarefa *</label>
            <input 
              type="text" 
              value={taskName} 
              onChange={(e) => setTaskName(e.target.value)} 
              style={styles.input}
              placeholder="Digite o título da tarefa..."
              required 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Descrição</label>
            <textarea 
              value={taskDesc} 
              onChange={(e) => setTaskDesc(e.target.value)} 
              style={styles.textarea}
              placeholder="Descreva a tarefa..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Prazo Final *</label>
            <input 
              type="date" 
              value={taskDeadline} 
              onChange={(e) => setTaskDeadline(e.target.value)} 
              style={styles.input}
              required 
            />
          </div>

          <button type="submit" disabled={taskLoading} style={styles.submitBtn}>
            {taskLoading ? 'Salvando...' : 'Adicionar Tarefa'}
          </button>
        </form>
      </section>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px 20px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box'
  },
  header: {
    marginBottom: '30px'
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '15px',
    display: 'inline-block'
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    color: 'var(--text-h)'
  },
  desc: {
    color: 'var(--text)',
    fontSize: '16px',
    margin: 0
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  card: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: 'var(--shadow)',
    textAlign: 'center'
  },
  cardTitle: {
    margin: '0 0 5px 0',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text)'
  },
  number: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: 0,
    color: 'var(--text-h)'
  },
  progressSection: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: 'var(--shadow)',
    marginBottom: '30px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    fontWeight: 'bold',
    fontSize: '18px',
    color: 'var(--text-h)'
  },
  progressBarBg: {
    backgroundColor: 'var(--border)',
    borderRadius: '8px',
    height: '16px',
    width: '100%',
    overflow: 'hidden',
    marginBottom: '15px'
  },
  progressBarFill: {
    backgroundColor: '#3b82f6',
    height: '100%',
    transition: 'width 0.3s ease'
  },
  datesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--text)'
  },
  delayedSection: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: 'var(--shadow)'
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '15px'
  },
  taskCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.05)'
  },
  taskStatus: {
    marginLeft: '10px',
    fontSize: '12px',
    padding: '3px 8px',
    borderRadius: '12px',
    backgroundColor: '#f59e0b',
    color: '#fff',
    fontWeight: 'bold'
  },
  message: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '20px'
  },
  error: {
    color: '#ef4444'
  },
  allTasksSection: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: 'var(--shadow)',
    marginTop: '30px'
  },
  newTaskSection: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: 'var(--shadow)',
    marginTop: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-h)'
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    fontSize: '15px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)'
  },
  textarea: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    fontSize: '15px',
    minHeight: '80px',
    resize: 'vertical',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)'
  },
  submitBtn: {
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  errorMessage: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  }
};

export default TelaDashboard;
