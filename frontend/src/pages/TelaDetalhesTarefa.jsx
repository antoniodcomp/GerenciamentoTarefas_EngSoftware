import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useTaskDetails, 
  useCreateSubtask, 
  useUploadTaskAttachment, 
  useCreateTaskComment, 
  useUpdateTaskStatus, 
  useUpdateSubtaskStatus 
} from '../hooks/useTarefas';
import { ArrowLeft, Plus, Paperclip, MessageSquare, Calendar, FileText, Upload, ChevronDown } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('pt-BR');
};

const getTaskBadgeClass = (status) => {
  if (status === 'CONCLUIDA') return 'bg-emerald-100 text-emerald-800';
  if (status === 'EM_ANDAMENTO') return 'bg-blue-100 text-blue-800';
  return 'bg-amber-100 text-amber-800';
};

const SubtaskList = ({ subtasks, onStatusChange }) => {
  if (!subtasks || subtasks.length === 0) {
    return <p className="text-gray-500 text-sm italic mb-0">Nenhuma subtarefa cadastrada.</p>;
  }
  return (
    <ul className="list-none p-0 m-0">
      {subtasks.map(subtask => (
        <li key={subtask.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 flex justify-between items-center">
          <div className="flex-1 pr-4">
            <h4 className="text-gray-900 font-bold text-base mb-1 m-0">{subtask.name}</h4>
            <p className="text-gray-600 text-sm mb-2">{subtask.description || <span className="italic opacity-60">Sem descrição informada.</span>}</p>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar size={14} />
              Prazo: {formatDate(subtask.deadline)}
            </div>
          </div>
          <div className="relative inline-block">
            <select 
              value={subtask.status} 
              onChange={(e) => onStatusChange(subtask.id, e.target.value)}
              className={`rounded-full pl-3 pr-7 py-0.5 text-xs font-semibold cursor-pointer border-none outline-none text-left appearance-none ${getTaskBadgeClass(subtask.status)}`}
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              <option value="PENDENTE" className="text-gray-900 bg-white">PENDENTE</option>
              <option value="EM_ANDAMENTO" className="text-gray-900 bg-white">EM ANDAMENTO</option>
              <option value="CONCLUIDA" className="text-gray-900 bg-white">CONCLUÍDA</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-current pointer-events-none opacity-70" />
          </div>
        </li>
      ))}
    </ul>
  );
};

const AttachmentList = ({ files }) => {
  if (!files || files.length === 0) {
    return <p className="text-gray-500 text-sm italic mb-5">Nenhum arquivo anexado a esta tarefa.</p>;
  }
  return (
    <ul className="list-none p-0 m-0 mb-4">
      {files.map(anexo => (
        <li key={anexo.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 flex justify-between items-center">
          <div>
            <a href={`${anexo.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-2 mb-1 text-sm">
              <FileText size={16} />
              {anexo.file_name}
            </a>
            <div className="text-xs text-gray-500">Enviado por: {anexo.user_name || 'Usuário'}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <p className="text-gray-500 text-sm italic mb-5">Nenhum comentário nesta tarefa.</p>;
  }
  return (
    <ul className="list-none p-0 m-0 mb-4">
      {comments.map(comentario => (
        <li key={comentario.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
          <div className="mb-2 text-gray-900 font-bold text-sm flex items-center gap-2">
            {comentario.user_name || 'Usuário'}
            <span className="font-normal text-xs text-gray-500">
              {new Date(comentario.date).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
            {comentario.text}
          </div>
        </li>
      ))}
    </ul>
  );
};

function TelaDetalhesTarefa() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const { data: task, isLoading, isError } = useTaskDetails(taskId);
  const { mutateAsync: createSubtask, isPending: submittingSubtask } = useCreateSubtask();
  const { mutateAsync: uploadAttachment, isPending: uploading } = useUploadTaskAttachment();
  const { mutateAsync: createComment, isPending: commenting } = useCreateTaskComment();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const { mutate: updateSubtaskStatus } = useUpdateSubtaskStatus();

  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ name: '', description: '', deadline: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const handleCreateSubtask = async (e) => {
    e.preventDefault();
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
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMsg(Object.values(error.response.data).flat().join(', '));
      } else {
        setErrorMsg('Erro ao criar subtarefa. Verifique os dados e tente novamente.');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('O arquivo selecionado excede o limite de 5MB permitido.');
      setSelectedFile(null);
      e.target.value = null;
      return;
    }

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
    setUploadError('');

    const formData = new FormData();
    formData.append('file_path', selectedFile);
    formData.append('file_name', selectedFile.name);
    formData.append('task', taskId);

    try {
      await uploadAttachment(formData);
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      if (error.response && error.response.data) {
         const errors = Object.values(error.response.data).flat();
         setUploadError(errors.join(', '));
      } else {
         setUploadError('Erro inesperado ao anexar o arquivo. Tente novamente.');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentError('');

    try {
      await createComment({
        text: newComment,
        task: taskId
      });
      setNewComment('');
    } catch (error) {
      if (error.response && error.response.data) {
         const errors = Object.values(error.response.data).flat();
         setCommentError(errors.join(', '));
      } else {
         setCommentError('Erro ao enviar o comentário. Tente novamente.');
      }
    }
  };

  const handleTaskStatusChange = (e) => {
    updateTaskStatus({ taskId, newStatus: e.target.value }, {
      onError: () => alert('Erro ao atualizar status da tarefa')
    });
  };

  const handleSubtaskStatusChange = (subtaskId, newStatus) => {
    updateSubtaskStatus({ subtaskId, newStatus }, {
      onError: () => alert('Erro ao atualizar status da subtarefa')
    });
  };

  if (isLoading) return <div className="bg-gray-50 min-h-screen p-8 text-center text-gray-500 text-sm">Carregando Tarefa...</div>;
  if (isError || !task) return <div className="bg-gray-50 min-h-screen p-8 text-center text-red-500 text-sm">Erro ao carregar a tarefa.</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-left">
        <button 
          onClick={() => navigate(`/projetos/${projectId}/dashboard`)} 
          className="flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
            <h1 className="text-gray-900 font-bold text-3xl m-0">{task.name}</h1>
            <div className="relative inline-block">
              <select 
                value={task.status} 
                onChange={handleTaskStatusChange}
                className={`rounded-full pl-4 pr-8 py-1 text-sm font-semibold cursor-pointer border-none outline-none appearance-none ${getTaskBadgeClass(task.status)}`}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                <option value="PENDENTE" className="text-gray-900 bg-white">PENDENTE</option>
                <option value="EM_ANDAMENTO" className="text-gray-900 bg-white">EM ANDAMENTO</option>
                <option value="CONCLUIDA" className="text-gray-900 bg-white">CONCLUÍDA</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-current pointer-events-none opacity-70" />
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-lg border-b border-gray-200 pb-2 mb-4 m-0">Descrição da Tarefa</h3>
            <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap m-0">
              {task.description || <i className="text-gray-400">Nenhuma descrição detalhada foi fornecida para esta tarefa.</i>}
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-lg border-b border-gray-200 pb-2 mb-4 m-0">Prazos e Informações</h3>
            <p className="text-gray-500 text-sm flex items-center gap-2 m-0">
              <Calendar size={16} className="text-gray-400" />
              <strong className="text-gray-900">Prazo Final:</strong> {formatDate(task.deadline)}
            </p>
          </div>

          {/* --- Seção de Subtarefas --- */}
          <div className="mb-10">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-gray-900 font-bold text-lg m-0 flex items-center gap-2">
                Subtarefas
              </h3>
              <button 
                onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                className="bg-slate-900 text-white rounded-md px-3 py-1.5 hover:bg-slate-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                {showSubtaskForm ? 'Cancelar' : <><Plus size={14} /> Nova Subtarefa</>}
              </button>
            </div>

            {showSubtaskForm && (
              <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-gray-900 font-bold text-base mb-4 m-0">Cadastrar Subtarefa</h4>
                {errorMsg && <div className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm">{errorMsg}</div>}
                <form onSubmit={handleCreateSubtask}>
                  <div className="mb-4">
                    <label className="block text-gray-900 font-bold text-sm mb-1.5">Título</label>
                    <input 
                      type="text" 
                      value={newSubtask.name}
                      onChange={(e) => setNewSubtask({...newSubtask, name: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 box-border"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 font-bold text-sm mb-1.5">Descrição</label>
                    <textarea 
                      value={newSubtask.description}
                      onChange={(e) => setNewSubtask({...newSubtask, description: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-slate-900 box-border"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-gray-900 font-bold text-sm mb-1.5">Prazo Final</label>
                    <input 
                      type="datetime-local" 
                      value={newSubtask.deadline}
                      onChange={(e) => setNewSubtask({...newSubtask, deadline: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 box-border"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingSubtask}
                    className={`bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium border-none cursor-pointer ${submittingSubtask ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                  >
                    {submittingSubtask ? 'Salvando...' : 'Salvar Subtarefa'}
                  </button>
                </form>
              </div>
            )}

            <div>
              <SubtaskList subtasks={task.subtasks} onStatusChange={handleSubtaskStatusChange} />
            </div>
          </div>

          {/* --- Seção de Anexos --- */}
          <div className="mb-10">
            <div className="border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-gray-900 font-bold text-lg m-0 flex items-center gap-2">
                <Paperclip size={18} />
                Anexos
              </h3>
            </div>

            <AttachmentList files={task.files} />

            <div className="p-5 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
              <h4 className="text-gray-900 font-bold text-base mb-4 m-0">Adicionar Novo Anexo</h4>
              {uploadError && <div className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm">{uploadError}</div>}
              
              <form onSubmit={handleFileUpload} className="flex items-center gap-3 flex-wrap">
                <input 
                  id="file-upload-input"
                  type="file" 
                  onChange={handleFileChange}
                  className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 box-border"
                />
                <button 
                  type="submit" 
                  disabled={!selectedFile || uploading}
                  className={`flex items-center gap-2 bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium border-none cursor-pointer ${(!selectedFile || uploading) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                >
                  <Upload size={16} />
                  {uploading ? 'Enviando...' : 'Anexar'}
                </button>
              </form>
            </div>
          </div>

          {/* --- Seção de Comentários --- */}
          <div>
            <div className="border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-gray-900 font-bold text-lg m-0 flex items-center gap-2">
                <MessageSquare size={18} />
                Comentários
              </h3>
            </div>

            <CommentList comments={task.comments} />

            <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-gray-900 font-bold text-base mb-4 m-0">Adicionar Comentário</h4>
              {commentError && <div className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm">{commentError}</div>}
              
              <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva seu comentário aqui..."
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-3 text-sm text-gray-900 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-slate-900 box-border"
                  required
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim() || commenting}
                  className={`self-start bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium border-none cursor-pointer ${(!newComment.trim() || commenting) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                >
                  {commenting ? 'Enviando...' : 'Comentar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaDetalhesTarefa;
