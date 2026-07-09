import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectDashboard, useCreateTarefa, useUpdateTaskStatus } from '../hooks/useTarefas';
import { TarefaList } from '../components/TarefaList';
import AddMembroModal from '../components/AddMembroModal';
import { ArrowLeft, LayoutDashboard, ListTodo, AlertTriangle, CheckCircle2, Clock, ChevronDown, Search, Plus, Filter, X, Calendar as CalendarIcon, Users } from 'lucide-react';

const getStatusBadge = (status) => {
  if (status === 'CONCLUIDA') return 'bg-emerald-100/80 text-emerald-700 border-emerald-200';
  if (status === 'EM_ANDAMENTO') return 'bg-blue-100/80 text-blue-700 border-blue-200';
  return 'bg-gray-100/80 text-gray-700 border-gray-200';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('pt-BR');
};

function TelaDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useProjectDashboard(id);
  const { mutateAsync: createTarefa, isPending: taskLoading, error: taskErrorObj } = useCreateTarefa();
  const { mutate: updateStatus } = useUpdateTaskStatus();

  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [localTaskError, setLocalTaskError] = useState('');
  const [activeTab, setActiveTab] = useState('tarefas');
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isAddMembroModalOpen, setAddMembroModalOpen] = useState(false);
  const [taskSearchTerm, setTaskSearchTerm] = useState('');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) { setLocalTaskError('O título da tarefa é obrigatório.'); return; }
    if (!taskDeadline) { setLocalTaskError('O prazo é obrigatório.'); return; }

    setLocalTaskError('');

    try {
      await createTarefa({
        name: taskName.trim(),
        description: taskDesc.trim(),
        deadline: taskDeadline,
        project: id,
        participantes: taskAssignee ? [taskAssignee] : [],
      });
      setTaskName('');
      setTaskDesc('');
      setTaskDeadline('');
      setTaskAssignee('');
      setTaskModalOpen(false);
    } catch (err) {
      if (err.response && err.response.data) {
          const backendErrors = err.response.data;
          if (typeof backendErrors === 'object') {
            const messages = Object.entries(backendErrors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
              .join(' | ');
            setLocalTaskError(messages || 'Erro ao criar tarefa. Verifique os dados.');
          }
      } else {
          setLocalTaskError('Erro ao criar tarefa. Tente novamente.');
      }
    }
  };

  const handleTaskStatusChange = (taskId, newStatus, e) => {
    e.stopPropagation();
    updateStatus({ taskId, newStatus }, {
      onError: () => alert('Erro ao atualizar status da tarefa')
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-gray-500 font-sans">Carregando painel do projeto...</div>;
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
        <button onClick={() => navigate('/projetos')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-xl px-4 py-2 mb-6 shadow-sm transition-all cursor-pointer">
          <ArrowLeft size={16} /> Voltar para Projetos
        </button>
        <div className="bg-red-50/80 backdrop-blur-xl text-red-600 p-6 rounded-3xl border border-red-200 text-center shadow-sm">
          Erro ao carregar o dashboard do projeto. Certifique-se de que o backend está rodando.
        </div>
      </div>
    );
  }

  const taskError = localTaskError || (taskErrorObj && taskErrorObj.message);

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden font-sans pb-16">
      {/* Decorative background for premium aesthetics */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-50/70 to-transparent -z-10"></div>
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-[80px] -z-10"></div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-start">
            <button onClick={() => navigate('/projetos')} className="mt-1 p-2 text-gray-500 hover:bg-white/80 hover:text-slate-900 rounded-xl transition-colors cursor-pointer border-none bg-transparent">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 m-0 line-clamp-1">{data.name}</h1>
              {data.description && (
                <p className="text-gray-600 text-[15px] m-0 line-clamp-2 max-w-2xl leading-relaxed">{data.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-center group hover:shadow-md transition-all">
            <div className="flex justify-center mb-3"><div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-gray-100 transition-colors"><ListTodo size={24} /></div></div>
            <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-wide mb-1 m-0">Total de Tarefas</h4>
            <p className="text-3xl font-bold text-slate-900 m-0">{data.total_tasks}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-center group hover:shadow-md transition-all">
            <div className="flex justify-center mb-3"><div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors"><AlertTriangle size={24} /></div></div>
            <h4 className="text-[13px] font-bold text-blue-400 uppercase tracking-wide mb-1 m-0">Pendentes</h4>
            <p className="text-3xl font-bold text-blue-600 m-0">{data.pending_tasks}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-center group hover:shadow-md transition-all">
            <div className="flex justify-center mb-3"><div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors"><Clock size={24} /></div></div>
            <h4 className="text-[13px] font-bold text-amber-400 uppercase tracking-wide mb-1 m-0">Em Andamento</h4>
            <p className="text-3xl font-bold text-amber-500 m-0">{data.in_progress_tasks}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-center group hover:shadow-md transition-all">
            <div className="flex justify-center mb-3"><div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors"><CheckCircle2 size={24} /></div></div>
            <h4 className="text-[13px] font-bold text-emerald-400 uppercase tracking-wide mb-1 m-0">Concluídas</h4>
            <p className="text-3xl font-bold text-emerald-600 m-0">{data.completed_tasks}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Progresso do Projeto */}
          <section className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-8 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-3 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 m-0 mb-1 tracking-tight">Evolução do Projeto</h3>
                <p className="text-gray-500 text-[14px] m-0 font-medium">Acompanhe o andamento geral das suas atividades</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-black text-4xl text-indigo-600 tracking-tighter block leading-none mb-1">{data.progress_percentage}%</span>
                <span className="text-[13px] text-gray-500 font-bold uppercase tracking-wide">{data.completed_tasks} de {data.total_tasks} tarefas</span>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-full h-4 w-full overflow-hidden mb-8 shadow-inner">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-700 ease-out relative" style={{ width: `${data.progress_percentage}%` }}>
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm"><CalendarIcon size={20}/></div>
                <div>
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Início</div>
                  <div className="text-[15px] font-bold text-slate-900">{formatDate(data.startline)}</div>
                </div>
              </div>
              <div className="hidden sm:block h-10 w-px bg-gray-200"></div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Prazo Final</div>
                  <div className="text-[15px] font-bold text-slate-900">{formatDate(data.deadline)}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-sm"><Clock size={20}/></div>
              </div>
            </div>
          </section>

          {/* Tarefas Atrasadas */}
          <section className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-1 flex flex-col justify-center items-center text-center relative overflow-hidden group">
            {data.delayed_tasks && data.delayed_tasks.length > 0 ? (
              <>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle size={32} />
                </div>
                <p className="text-6xl font-black text-slate-900 m-0 mb-2 tracking-tighter">{data.delayed_tasks.length}</p>
                <p className="text-red-600 text-[13px] m-0 font-bold uppercase tracking-widest">Tarefas Atrasadas</p>
              </>
            ) : (
              <>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-[18px] font-black text-slate-900 m-0 mb-1 tracking-tight">Tudo em dia!</p>
                <p className="text-gray-500 text-[14px] m-0 font-medium">Nenhuma tarefa atrasada.</p>
              </>
            )}
          </section>
        </div>

        {/* Tabs section */}
        <div>
          <div className="inline-flex bg-gray-100/80 backdrop-blur p-1 rounded-xl mb-6 shadow-inner">
            <button 
              onClick={() => setActiveTab('tarefas')}
              className={`px-6 py-2.5 text-[14px] font-bold rounded-lg transition-all border-none cursor-pointer ${activeTab === 'tarefas' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              Tarefas
            </button>
            <button 
              onClick={() => setActiveTab('equipe')}
              className={`px-6 py-2.5 text-[14px] font-bold rounded-lg transition-all border-none cursor-pointer ${activeTab === 'equipe' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              Equipe
            </button>
          </div>

          {activeTab === 'tarefas' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch w-full max-w-xl">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar tarefas..."
                      value={taskSearchTerm}
                      onChange={(e) => setTaskSearchTerm(e.target.value)}
                      className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl px-4 py-3 pl-11 w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-[15px] transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] box-border"
                    />
                  </div>
                  <button className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200/60 rounded-2xl bg-white/80 backdrop-blur-xl text-gray-700 hover:text-gray-900 hover:bg-white text-[15px] font-medium transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer shrink-0">
                    <Filter size={18} /> Filtros
                  </button>
                </div>
                <button 
                  onClick={() => setTaskModalOpen(true)}
                  className="bg-slate-900 text-white rounded-xl px-5 py-3 hover:bg-slate-800 flex items-center gap-2 text-[14px] font-medium transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer border-none"
                >
                  <Plus size={18} /> Nova Tarefa
                </button>
              </div>

              <TarefaList projetoId={id} searchTerm={taskSearchTerm} />
            </div>
          )}

          {activeTab === 'equipe' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-end mb-6">
                <button onClick={() => setAddMembroModalOpen(true)} className="bg-slate-900 text-white rounded-xl px-5 py-3 hover:bg-slate-800 flex items-center gap-2 text-[14px] font-medium transition-all shadow-md hover:shadow-lg cursor-pointer border-none">
                  <Plus size={18} /> Adicionar Membro
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.participantes && data.participantes.length > 0 ? data.participantes.map(user => (
                  <div key={user.id} className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 flex flex-col relative shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border border-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-xl shadow-inner mb-4">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h4 className="font-bold text-slate-900 m-0 text-lg">{user.name}</h4>
                    <p className="text-[14px] text-gray-500 m-0 mt-1">{user.professional_role || 'Membro da Equipe'}</p>
                  </div>
                )) : (
                  <div className="col-span-full text-center p-12 bg-white/50 border border-dashed border-gray-300 rounded-3xl text-gray-500">
                    Nenhum membro listado no momento.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Nova Tarefa */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 relative">
            <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 m-0">Criar Nova Tarefa</h2>
                <p className="text-[13px] text-gray-500 m-0 mt-1">Preencha os detalhes da nova tarefa</p>
              </div>
              <button 
                onClick={() => setTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-7 space-y-5 m-0">
              {taskError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                  {taskError}
                </div>
              )}
              
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Nome da Tarefa <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={taskName} 
                  onChange={(e) => setTaskName(e.target.value)} 
                  className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border"
                  placeholder="Ex: Implementar funcionalidade X"
                  required 
                  disabled={taskLoading}
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Descrição</label>
                <textarea 
                  value={taskDesc} 
                  onChange={(e) => setTaskDesc(e.target.value)} 
                  className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border min-h-[100px] box-border"
                  placeholder="Descreva a tarefa..."
                  disabled={taskLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Data de Início</label>
                  <input 
                    type="date" 
                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border text-slate-900"
                    disabled={taskLoading}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Data de Término <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={taskDeadline} 
                    onChange={(e) => setTaskDeadline(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border text-slate-900"
                    required 
                    disabled={taskLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Atribuir a</label>
                <div className="relative">
                  <select 
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full appearance-none rounded-xl border-gray-200 bg-gray-50/50 pl-4 pr-10 py-3 text-[15px] text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border cursor-pointer" 
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                    disabled={taskLoading}
                  >
                    <option value="">Selecione um membro</option>
                    {data?.participantes?.map(membro => (
                      <option key={membro.id} value={membro.id}>
                        {membro.name} ({membro.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
                <button 
                  type="button" 
                  onClick={() => setTaskModalOpen(false)}
                  disabled={taskLoading} 
                  className="px-5 py-2.5 text-[14px] font-bold text-slate-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={taskLoading} 
                  className="px-6 py-2.5 text-[14px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none"
                >
                  {taskLoading ? 'Salvando...' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Membro */}
      <AddMembroModal 
        isOpen={isAddMembroModalOpen} 
        onClose={() => setAddMembroModalOpen(false)} 
        projectId={id} 
        currentParticipantes={data?.participantes || []} 
      />
    </div>
  );
}

export default TelaDashboard;

