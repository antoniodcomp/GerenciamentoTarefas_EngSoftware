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
import { ArrowLeft, MoreHorizontal, CheckCircle2, Circle, Paperclip, Calendar, Clock, ChevronDown, Plus, X, Upload } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('pt-BR');
};

const getStatusBadge = (status) => {
  if (status === 'CONCLUIDA') return 'bg-emerald-100/80 text-emerald-700 border-emerald-200';
  if (status === 'EM_ANDAMENTO') return 'bg-blue-100/80 text-blue-700 border-blue-200';
  return 'bg-gray-100/80 text-gray-700 border-gray-200';
};

const SubtaskModal = ({ isOpen, onClose, onSubmit, submitting, newSubtask, setNewSubtask, errorMsg }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900 m-0">Nova Subtarefa</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {errorMsg && <div className="text-red-600 bg-red-50 p-3 rounded-xl mb-4 text-sm">{errorMsg}</div>}
          <form onSubmit={onSubmit} className="space-y-4 m-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={newSubtask.name} onChange={e => setNewSubtask({...newSubtask, name: e.target.value})} className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all outline-none border box-border" required />
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

const PillSwitcher = ({ activeTab, setActiveTab, counts }) => {
  return (
    <div className="inline-flex bg-gray-100/80 backdrop-blur p-1 rounded-xl mb-6 shadow-inner">
      <button 
        type="button"
        onClick={() => setActiveTab('subtasks')}
        className={`px-5 py-2 text-sm font-medium rounded-lg transition-all border-none cursor-pointer ${activeTab === 'subtasks' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
      >
        Subtarefas <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-gray-200/60 font-semibold">{counts.subtasks}</span>
      </button>
      <button 
        type="button"
        onClick={() => setActiveTab('comments')}
        className={`px-5 py-2 text-sm font-medium rounded-lg transition-all border-none cursor-pointer ${activeTab === 'comments' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
      >
        Comentários <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-gray-200/60 font-semibold">{counts.comments}</span>
      </button>
      <button 
        type="button"
        onClick={() => setActiveTab('attachments')}
        className={`px-5 py-2 text-sm font-medium rounded-lg transition-all border-none cursor-pointer ${activeTab === 'attachments' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
      >
        Anexos <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-gray-200/60 font-semibold">{counts.attachments}</span>
      </button>
    </div>
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

  const [activeTab, setActiveTab] = useState('subtasks');
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ name: '', description: '', start_date: '', deadline: '' });
  const [errorMsg, setErrorMsg] = useState('');
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
      setShowSubtaskModal(false);
      setNewSubtask({ name: '', description: '', start_date: '', deadline: '' });
    } catch (error) {
      if (error.response?.data) {
        setErrorMsg(Object.values(error.response.data).flat().join(', '));
      } else {
        setErrorMsg('Erro ao criar subtarefa. Verifique os dados e tente novamente.');
      }
    }
  };

  const handleFileUploadDirect = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('O arquivo selecionado excede o limite de 5MB permitido.');
      return;
    }
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'txt', 'doc', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setUploadError(`Formato não suportado. Os formatos aceitos são: ${allowedExtensions.join(', ')}.`);
      return;
    }

    const formData = new FormData();
    formData.append('file_path', file);
    formData.append('file_name', file.name);
    formData.append('task', taskId);

    try {
      setUploadError('');
      await uploadAttachment(formData);
    } catch (error) {
      if (error.response?.data) {
         setUploadError(Object.values(error.response.data).flat().join(', '));
      } else {
         setUploadError('Erro inesperado ao anexar o arquivo.');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentError('');
    try {
      await createComment({ text: newComment, task: taskId });
      setNewComment('');
    } catch (error) {
      if (error.response?.data) {
         setCommentError(Object.values(error.response.data).flat().join(', '));
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

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-500">Carregando Tarefa...</div>;
  if (isError || !task) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">Erro ao carregar a tarefa.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden font-sans">
      {/* Decorative background for premium aesthetics */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-50/70 to-transparent -z-10"></div>
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-[80px] -z-10"></div>
      
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-4 items-start">
            <button 
              onClick={() => navigate(`/projetos/${projectId}/dashboard`)} 
              className="mt-1 p-2 text-gray-500 hover:bg-white/80 hover:text-slate-900 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 m-0 line-clamp-1">{task.name}</h1>
              <p className="text-gray-600 text-[15px] m-0 line-clamp-2 max-w-2xl leading-relaxed">
                Projeto: <span className="font-medium text-slate-800">{task.project_name || 'Desconhecido'}</span>
              </p>
            </div>
          </div>
          <button type="button" className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors cursor-pointer mt-1 shadow-sm border border-transparent hover:border-gray-200/60 bg-transparent">
            <MoreHorizontal size={20} />
          </button>
        </div>        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Column */}
          <div className="flex-1 w-full space-y-6">
            {/* Description Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-7 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 m-0">Descrição</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px] m-0">
                {task.description || <span className="italic opacity-60">Nenhuma descrição fornecida.</span>}
              </p>
            </div>

            {/* Tabs Area */}
            <div className="pt-2">
              <PillSwitcher 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                counts={{subtasks: task.subtasks?.length || 0, comments: task.comments?.length || 0, attachments: task.files?.length || 0}} 
              />
              
              <div className="animate-in fade-in duration-300">
                {/* Subtasks Tab */}
                {activeTab === 'subtasks' && (
                  <div>
                    <div className="flex justify-end mb-4">
                      <button 
                        type="button"
                        onClick={() => setShowSubtaskModal(true)} 
                        className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border-none"
                      >
                        <Plus size={16} /> Nova Subtarefa
                      </button>
                    </div>
                    {(!task.subtasks || task.subtasks.length === 0) && (
                      <div className="text-center p-8 bg-white/50 border border-dashed border-gray-300 rounded-2xl text-gray-500 text-sm">
                        Nenhuma subtarefa criada ainda.
                      </div>
                    )}
                    <div className="space-y-3">
                      {task.subtasks?.map(subtask => {
                        const isCompleted = subtask.status === 'CONCLUIDA';
                        return (
                          <div key={subtask.id} className="flex items-center justify-between p-4 bg-white border border-gray-200/60 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4 flex-1 pl-2">
                              <div>
                                <h4 className={`text-[15px] font-bold transition-all m-0 ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{subtask.name}</h4>
                                {subtask.description && (
                                  <p className={`text-[13px] mt-1 mb-0 ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>{subtask.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <select 
                                  value={subtask.status} 
                                  onChange={(e) => handleSubtaskStatusChange(subtask.id, e.target.value)}
                                  className={`appearance-none text-[11px] font-bold px-3 py-1 pr-6 rounded-full border outline-none cursor-pointer transition-all bg-white ${getStatusBadge(subtask.status)} tracking-wide`}
                                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                >
                                  <option value="PENDENTE">PENDENTE</option>
                                  <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                                  <option value="CONCLUIDA">CONCLUÍDA</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                              </div>
                              <button type="button" className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-transparent border-none">
                                <MoreHorizontal size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div>
                    {commentError && <div className="text-red-600 bg-red-50 p-3 rounded-xl mb-4 text-sm border border-red-100">{commentError}</div>}
                    <form onSubmit={handleCommentSubmit} className="mb-8 m-0">
                      <div className="relative bg-white border border-gray-200/80 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all overflow-hidden">
                        <textarea 
                          placeholder="Adicione um comentário..." 
                          value={newComment} 
                          onChange={e => setNewComment(e.target.value)}
                          className="w-full bg-transparent border-none px-5 pt-4 pb-14 text-[15px] text-gray-900 focus:outline-none focus:ring-0 min-h-[130px] resize-y box-border" 
                        />
                        <div className="absolute bottom-2 left-2 right-2 flex justify-end items-center bg-white p-1.5 rounded-xl">
                          <button type="submit" disabled={commenting || !newComment.trim()} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 cursor-pointer border-none">
                            {commenting ? 'Enviando...' : 'Enviar'}
                          </button>
                        </div>
                      </div>
                    </form>
                    
                    <div className="space-y-4">
                      {(!task.comments || task.comments.length === 0) && (
                        <div className="text-center p-8 text-gray-500 text-sm">Nenhum comentário.</div>
                      )}
                      {task.comments?.map(comment => (
                        <div key={comment.id} className="flex gap-4 p-5 bg-white border border-gray-200/60 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border border-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-sm shadow-inner">
                            {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-bold text-gray-900 text-[15px]">{comment.user_name || 'Usuário'}</span>
                              <span className="text-xs font-medium text-gray-400">{new Date(comment.date).toLocaleString('pt-BR')}</span>
                            </div>
                            <p className="text-gray-600 text-[15px] whitespace-pre-wrap leading-relaxed m-0">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments Tab */}
                {activeTab === 'attachments' && (
                  <div>
                    <div className="flex justify-end mb-4">
                      <div>
                        <input type="file" id="file-upload" className="hidden" onChange={e => { if (e.target.files[0]) handleFileUploadDirect(e.target.files[0]); }} />
                        <label htmlFor="file-upload" className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer inline-flex m-0">
                          {uploading ? 'Enviando...' : <><Upload size={16} /> Enviar Arquivo</>}
                        </label>
                      </div>
                    </div>
                    {uploadError && <div className="text-red-600 bg-red-50 p-3 rounded-xl mb-4 text-sm border border-red-100">{uploadError}</div>}
                    
                    {(!task.files || task.files.length === 0) && (
                      <div className="text-center p-8 bg-white/50 border border-dashed border-gray-300 rounded-2xl text-gray-500 text-sm">
                        Nenhum arquivo anexado.
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {task.files?.map(file => (
                        <div key={file.id} className="p-4 bg-white border border-gray-200/60 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:shadow-md transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50/80 flex items-center justify-center text-indigo-500 border border-indigo-100/50">
                            <Paperclip size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <a href={`http://localhost:8000${file.file_path}`} target="_blank" rel="noreferrer" className="text-[14px] font-bold text-gray-900 truncate block hover:text-indigo-600 transition-colors mb-0.5">
                              {file.file_name}
                            </a>
                            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Por {file.user_name || 'Usuário'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Column */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-4">
            {/* Status Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-5 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Status</label>
              <div className="relative">
                <select 
                  value={task.status} 
                  onChange={handleTaskStatusChange}
                  className={`w-full appearance-none rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold outline-none border transition-all cursor-pointer ${getStatusBadge(task.status)} bg-white`}
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="PENDENTE">PENDENTE</option>
                  <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                  <option value="CONCLUIDA">CONCLUÍDA</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60" />
              </div>
            </div>
            
            {/* Prazos Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-5 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Prazos</label>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5 text-gray-500 font-medium">
                    <Calendar size={16} className="text-gray-400" />
                    Início
                  </span>
                  <span className="font-bold text-gray-900">{formatDate(task.start_date || task.created_at)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5 text-gray-500 font-medium">
                    <Clock size={16} className="text-gray-400" />
                    Término
                  </span>
                  <span className="font-bold text-gray-900">{formatDate(task.deadline)}</span>
                </div>
              </div>
            </div>
            
            {/* Assigned Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-5 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Atribuído a</label>
              <div className="flex flex-wrap gap-2">
                {task.participantes?.length ? (
                  task.participantes.map(member => (
                    <div key={member.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-full pr-3.5 p-1.5 shadow-sm">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{member.name || 'Usuário'}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic font-medium">Não atribuído</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubtaskModal 
        isOpen={showSubtaskModal} 
        onClose={() => setShowSubtaskModal(false)} 
        onSubmit={handleCreateSubtask} 
        submitting={submittingSubtask} 
        newSubtask={newSubtask} 
        setNewSubtask={setNewSubtask} 
        errorMsg={errorMsg} 
      />
    </div>
  );
}

export default TelaDetalhesTarefa;
