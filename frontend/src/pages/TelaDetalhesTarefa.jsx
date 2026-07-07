import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskDetails, createSubtask, uploadTaskAttachment, createTaskComment, updateTaskStatus, updateSubtaskStatus } from '../services/api';

function TelaDetalhesTarefa() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ name: '', description: '', deadline: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState('');

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
        name: newSubtask.name,
        description: newSubtask.description,
        deadline: newSubtask.deadline,
        task: taskId
      });
      setShowSubtaskForm(false);
      setNewSubtask({ name: '', description: '', deadline: '' });
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validação de Tamanho (RF23 / 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('O arquivo selecionado excede o limite de 5MB permitido.');
      setSelectedFile(null);
      e.target.value = null;
      return;
    }

    // Validação de Extensão
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'txt', 'doc', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setUploadError(`Formato não suportado. Os formatos aceitos são: ${allowedExtensions.join(', ')}.`);
      setSelectedFile(null);
      e.target.value = null;
      return;
    }

    setUploadError('');
    setSelectedFile(file);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file_path', selectedFile);
    formData.append('file_name', selectedFile.name);
    formData.append('task', taskId);

    try {
      await uploadTaskAttachment(formData);
      setSelectedFile(null);
      
      // Reseta o input visualmente procurando ele no DOM (opcional)
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';

      fetchTaskAgain();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
         const errors = Object.values(error.response.data).flat();
         setUploadError(errors.join(', '));
      } else {
         setUploadError('Erro inesperado ao anexar o arquivo. Tente novamente.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    setCommentError('');

    try {
      await createTaskComment({
        text: newComment,
        task: taskId
      });
      setNewComment('');
      fetchTaskAgain();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
         const errors = Object.values(error.response.data).flat();
         setCommentError(errors.join(', '));
      } else {
         setCommentError('Erro ao enviar o comentário. Tente novamente.');
      }
    } finally {
      setCommenting(false);
    }
  };

  const handleTaskStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateTaskStatus(taskId, newStatus);
      fetchTaskAgain();
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Erro ao atualizar status da tarefa');
    }
  };

  const handleSubtaskStatusChange = async (subtaskId, newStatus) => {
    try {
      await updateSubtaskStatus(subtaskId, newStatus);
      fetchTaskAgain();
    } catch (err) {
      console.error('Error updating subtask status:', err);
      alert('Erro ao atualizar status da subtarefa');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ margin: '0 0 10px 0', color: 'var(--text-h)', fontSize: '32px' }}>{task.name}</h1>
          <select 
            value={task.status} 
            onChange={handleTaskStatusChange}
            style={{ ...getTaskBadgeStyle(task.status), border: 'none', cursor: 'pointer', outline: 'none' }}
          >
            <option value="PENDENTE">PENDENTE</option>
            <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
            <option value="CONCLUIDA">CONCLUÍDA</option>
          </select>
        </div>
        
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Descrição da Tarefa</h3>
          <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '16px' }}>
            {task.description || <i>Nenhuma descrição detalhada foi fornecida para esta tarefa.</i>}
          </p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Prazos e Informações</h3>
          <p style={{ color: 'var(--text)' }}><strong>Prazo Final:</strong> {formatDate(task.deadline)}</p>
        </div>

        {/* --- Seção de Subtarefas --- */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Subtarefas</h3>
            <button 
              onClick={() => setShowSubtaskForm(!showSubtaskForm)}
              style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
                    value={newSubtask.name}
                    onChange={(e) => setNewSubtask({...newSubtask, name: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Descrição</label>
                  <textarea 
                    value={newSubtask.description}
                    onChange={(e) => setNewSubtask({...newSubtask, description: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '60px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Prazo Final</label>
                  <input 
                    type="datetime-local" 
                    value={newSubtask.deadline}
                    onChange={(e) => setNewSubtask({...newSubtask, deadline: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Salvando...' : 'Salvar Subtarefa'}
                </button>
              </form>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            {task.subtasks && task.subtasks.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {task.subtasks.map(subtask => (
                  <li key={subtask.id} style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-h)' }}>{subtask.name}</h4>
                      <div style={{ fontSize: '14px', color: 'var(--text)' }}>Prazo: {formatDate(subtask.deadline)}</div>
                    </div>
                    <select 
                      value={subtask.status} 
                      onChange={(e) => handleSubtaskStatusChange(subtask.id, e.target.value)}
                      style={{ ...getTaskBadgeStyle(subtask.status), border: 'none', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="PENDENTE">PENDENTE</option>
                      <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                      <option value="CONCLUIDA">CONCLUÍDA</option>
                    </select>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text)', fontStyle: 'italic' }}>Nenhuma subtarefa cadastrada.</p>
            )}
          </div>
        </div>

        {/* --- Seção de Anexos --- */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Anexos</h3>
          </div>

          {/* Lista de Anexos */}
          <div style={{ marginBottom: '20px' }}>
            {task.files && task.files.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {task.files.map(anexo => (
                  <li key={anexo.id} style={{ padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <a href={`http://localhost:8000${anexo.file_path}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
                        {anexo.file_name}
                      </a>
                      <div style={{ fontSize: '12px', color: 'var(--text)' }}>Enviado por: {anexo.user_name || 'Usuário'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text)', fontStyle: 'italic', marginBottom: '20px' }}>Nenhum arquivo anexado a esta tarefa.</p>
            )}
          </div>

          {/* Formulário de Upload */}
          <div style={{ padding: '20px', backgroundColor: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-h)' }}>Adicionar Novo Anexo</h4>
            {uploadError && <div style={{ color: '#ef4444', marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>{uploadError}</div>}
            
            <form onSubmit={handleFileUpload} style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <input 
                id="file-upload-input"
                type="file" 
                onChange={handleFileChange}
                style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
              />
              <button 
                type="submit" 
                disabled={!selectedFile || uploading}
                style={{ padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: (!selectedFile || uploading) ? 'not-allowed' : 'pointer' }}
              >
                {uploading ? 'Enviando...' : 'Anexar Arquivo'}
              </button>
            </form>
          </div>
        </div>

        {/* --- Seção de Comentários --- */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Comentários</h3>
          </div>

          {/* Lista de Comentários */}
          <div style={{ marginBottom: '20px' }}>
            {task.comments && task.comments.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {task.comments.map(comentario => (
                  <li key={comentario.id} style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '10px', backgroundColor: 'var(--bg)' }}>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-h)' }}>
                      {comentario.user_name || 'Usuário'}
                      <span style={{ fontWeight: 'normal', fontSize: '12px', color: 'var(--text)', marginLeft: '10px' }}>
                        {new Date(comentario.date).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text)', lineHeight: '1.5' }}>
                      {comentario.text}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text)', fontStyle: 'italic', marginBottom: '20px' }}>Nenhum comentário nesta tarefa.</p>
            )}
          </div>

          {/* Formulário de Novo Comentário */}
          <div style={{ padding: '20px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-h)' }}>Adicionar Comentário</h4>
            {commentError && <div style={{ color: '#ef4444', marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>{commentError}</div>}
            
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva seu comentário aqui..."
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '80px', boxSizing: 'border-box' }}
                required
              />
              <button 
                type="submit" 
                disabled={!newComment.trim() || commenting}
                style={{ alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: (!newComment.trim() || commenting) ? 'not-allowed' : 'pointer' }}
              >
                {commenting ? 'Enviando...' : 'Comentar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaDetalhesTarefa;
