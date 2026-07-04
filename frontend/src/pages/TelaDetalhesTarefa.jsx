import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskDetails, createSubtask } from '../services/api';

function TelaDetalhesTarefa() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ nome: '', descricao: '', dataFim: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await getTaskDetails(taskId);
        setTask(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const fetchTaskAgain = async () => {
    try {
      const data = await getTaskDetails(taskId);
      setTask(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await createSubtask({
        ...newSubtask,
        tarefa: taskId
      });
      setShowSubtaskForm(false);
      setNewSubtask({ nome: '', descricao: '', dataFim: '' });
      fetchTaskAgain(); // Refresh task data to get new subtasks
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        setErrorMsg(Object.values(error.response.data).flat().join(', '));
      } else {
        setErrorMsg('Erro ao criar subtarefa. Verifique os dados e tente novamente.');
      }
    } finally {
      setSubmitting(false);
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
      fontSize: '12px',
      padding: '6px 12px',
      borderRadius: '16px',
      backgroundColor: bgColor,
      color: '#fff',
      fontWeight: 'bold',
      display: 'inline-block',
      marginTop: '10px'
    };
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Carregando Tarefa...</div>;
  if (!task) return <div style={{ padding: '50px', textAlign: 'center' }}>Erro ao carregar a tarefa.</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      <button 
        onClick={() => navigate(`/projetos/${projectId}/dashboard`)} 
        style={{ padding: '8px 16px', backgroundColor: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' }}
      >
        ← Voltar ao Dashboard
      </button>
      
      <div style={{ backgroundColor: 'var(--bg)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <h1 style={{ margin: '0 0 10px 0', color: 'var(--text-h)', fontSize: '32px' }}>{task.nome}</h1>
        <span style={getTaskBadgeStyle(task.status)}>
          STATUS: {task.status}
        </span>
        
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Descrição da Tarefa</h3>
          <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '16px' }}>
            {task.descricao || <i>Nenhuma descrição detalhada foi fornecida para esta tarefa.</i>}
          </p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Prazos e Informações</h3>
          <p style={{ color: 'var(--text)' }}><strong>Prazo Final:</strong> {formatDate(task.dataFim)}</p>
        </div>

        {/* --- Seção de Subtarefas --- */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Subtarefas</h3>
            <button 
              onClick={() => setShowSubtaskForm(!showSubtaskForm)}
              style={{ padding: '6px 12px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {showSubtaskForm ? 'Cancelar' : '+ Nova Subtarefa'}
            </button>
          </div>

          {showSubtaskForm && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-h)' }}>Cadastrar Subtarefa</h4>
              {errorMsg && <div style={{ color: '#ef4444', marginBottom: '15px' }}>{errorMsg}</div>}
              <form onSubmit={handleCreateSubtask}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Título</label>
                  <input 
                    type="text" 
                    value={newSubtask.nome}
                    onChange={(e) => setNewSubtask({...newSubtask, nome: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Descrição</label>
                  <textarea 
                    value={newSubtask.descricao}
                    onChange={(e) => setNewSubtask({...newSubtask, descricao: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '60px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Prazo Final</label>
                  <input 
                    type="datetime-local" 
                    value={newSubtask.dataFim}
                    onChange={(e) => setNewSubtask({...newSubtask, dataFim: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Salvando...' : 'Salvar Subtarefa'}
                </button>
              </form>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            {task.subtarefas && task.subtarefas.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {task.subtarefas.map(subtask => (
                  <li key={subtask.id} style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-h)' }}>{subtask.nome}</h4>
                      <div style={{ fontSize: '14px', color: 'var(--text)' }}>Prazo: {formatDate(subtask.dataFim)}</div>
                    </div>
                    <span style={getTaskBadgeStyle(subtask.status)}>{subtask.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text)', fontStyle: 'italic' }}>Nenhuma subtarefa cadastrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaDetalhesTarefa;
