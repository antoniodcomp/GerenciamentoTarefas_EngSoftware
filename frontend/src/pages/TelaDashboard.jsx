import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectDashboard, useCreateTarefa, useUpdateTaskStatus } from '../hooks/useTarefas';
import { TarefaList } from '../components/TarefaList';
import AddMembroModal from '../components/AddMembroModal';
import { ArrowLeft, LayoutDashboard, ListTodo, AlertTriangle, CheckCircle2, Clock, ChevronDown, Search, Plus, Filter, X, Calendar as CalendarIcon, Users } from 'lucide-react';

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <div className="bg-gray-50 min-h-screen p-8 text-center text-gray-600">Carregando painel do projeto...</div>;
  }

  if (isError || !data) {
    return (
      <div className="bg-gray-50 min-h-screen p-8">
        <button onClick={() => navigate('/projetos')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-1.5 mb-6">
          <ArrowLeft size={16} /> Voltar para Projetos
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-md border border-red-200 text-center">
          Erro ao carregar o dashboard do projeto. Certifique-se de que o backend está rodando.
        </div>
      </div>
    );
  }

  const taskError = localTaskError || (taskErrorObj && taskErrorObj.message);

  return (
    <div className="bg-[#F7F7F8] min-h-screen p-8">
      <div className="flex justify-between items-start mb-8 max-w-6xl mx-auto">
        <div className="flex gap-4 items-start">
          <button onClick={() => navigate('/projetos')} className="mt-1 p-2 text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A] rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#0A0A0A] mb-2 m-0 line-clamp-1">{data.name}</h1>
            {data.description && (
              <p className="text-[#6B7280] text-sm m-0 line-clamp-2 max-w-2xl">{data.description}</p>
            )}
          </div>
        </div>
        <button className="p-2 text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A] rounded-lg transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="flex justify-center mb-2"><ListTodo className="text-gray-400 w-6 h-6" /></div>
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Total de Tarefas</h4>
            <p className="text-3xl font-bold text-gray-900">{data.total_tasks}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 text-center">
            <div className="flex justify-center mb-2"><AlertTriangle className="text-blue-500 w-6 h-6" /></div>
            <h4 className="text-sm font-semibold text-blue-600 mb-1">Pendentes</h4>
            <p className="text-3xl font-bold text-blue-600">{data.pending_tasks}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 text-center">
            <div className="flex justify-center mb-2"><Clock className="text-amber-500 w-6 h-6" /></div>
            <h4 className="text-sm font-semibold text-amber-600 mb-1">Em Andamento</h4>
            <p className="text-3xl font-bold text-amber-600">{data.in_progress_tasks}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 text-center">
            <div className="flex justify-center mb-2"><CheckCircle2 className="text-emerald-500 w-6 h-6" /></div>
            <h4 className="text-sm font-semibold text-emerald-600 mb-1">Concluídas</h4>
            <p className="text-3xl font-bold text-emerald-600">{data.completed_tasks}</p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 m-0">Progresso do Projeto</h3>
            <span className="font-semibold text-slate-900 bg-gray-100 rounded-full px-3 py-1 text-sm">{data.progress_percentage}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 w-full overflow-hidden mb-4">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${data.progress_percentage}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Início: <strong className="text-gray-700">{formatDate(data.start_date)}</strong></span>
            <span>Prazo: <strong className="text-gray-700">{formatDate(data.deadline)}</strong></span>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-500 w-5 h-5" />
            <h3 className="text-lg font-bold text-gray-900 m-0">Tarefas Atrasadas</h3>
          </div>
          
          {data.delayed_tasks && data.delayed_tasks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.delayed_tasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border border-red-100 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer gap-3"
                  onClick={() => navigate(`/projetos/${id}/tarefas/${task.id}`)}
                  title="Clique para ver os detalhes da tarefa"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <strong className="text-gray-900">{task.name}</strong>
                    <div className="relative inline-block">
                      <select 
                        value={task.status} 
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="appearance-none bg-white border border-gray-300 shadow-sm rounded-md pl-3 pr-8 py-1.5 text-sm font-semibold cursor-pointer outline-none hover:bg-gray-50 focus:ring-2 focus:ring-slate-900 transition-colors text-gray-700"
                      >
                        <option value="PENDENTE">PENDENTE</option>
                        <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                        <option value="CONCLUIDA">CONCLUÍDA</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="text-red-600 text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Prazo: {formatDate(task.deadline)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-emerald-600 font-medium m-0 flex items-center gap-2 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
              Excelente! Não há tarefas atrasadas para este projeto.
            </p>
          )}
        </section>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#E5E7EB] p-1 rounded-lg w-max">
          <button 
            onClick={() => setActiveTab('tarefas')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'tarefas' ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B7280] hover:text-[#0A0A0A]'}`}
          >
            Tarefas
          </button>
          <button 
            onClick={() => setActiveTab('equipe')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'equipe' ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B7280] hover:text-[#0A0A0A]'}`}
          >
            Equipe
          </button>
        </div>

        {activeTab === 'tarefas' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex gap-4 items-center w-full sm:w-auto flex-1">
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar tarefas..."
                    value={taskSearchTerm}
                    onChange={(e) => setTaskSearchTerm(e.target.value)}
                    className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pl-9 w-full focus:ring-2 focus:ring-[#0A0A0A] outline-none text-sm transition-shadow"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#0A0A0A] hover:bg-gray-50 text-sm font-medium transition-colors shrink-0">
                  Todos <ChevronDown size={14} />
                </button>
              </div>
              <button 
                onClick={() => setTaskModalOpen(true)}
                className="bg-[#0A0A0A] text-white rounded-lg px-4 py-2 hover:bg-black flex items-center gap-2 text-sm font-medium transition-colors shrink-0"
              >
                <Plus size={16} /> Nova Tarefa
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
              <TarefaList projetoId={id} searchTerm={taskSearchTerm} />
            </div>
          </div>
        )}

        {activeTab === 'equipe' && (
          <div>
            <div className="flex justify-end mb-6">
              <button onClick={() => setAddMembroModalOpen(true)} className="bg-[#0A0A0A] text-white rounded-lg px-4 py-2 hover:bg-black flex items-center gap-2 text-sm font-medium transition-colors">
                <Plus size={16} /> Adicionar Membro
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.participantes && data.participantes.length > 0 ? data.participantes.map(user => (
                <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 flex flex-col relative">
                  <button className="absolute top-4 right-4 text-[#6B7280] hover:bg-gray-100 p-1 rounded-md transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                  <div className="h-12 w-12 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h4 className="font-bold text-[#0A0A0A] m-0">{user.name}</h4>
                  <p className="text-sm text-[#6B7280] m-0 mt-1">{user.professional_role || 'Membro da Equipe'}</p>
                  <p className="text-xs text-[#6B7280] m-0 mt-4">- tarefas ativas</p>
                </div>
              )) : (
                <p className="text-[#6B7280] col-span-full">Nenhum membro listado no momento.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar Nova Tarefa */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative">
            <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-[#0A0A0A] m-0">Criar Nova Tarefa</h2>
                <p className="text-sm text-[#6B7280] m-0 mt-1">Preencha os detalhes da nova tarefa</p>
              </div>
              <button 
                onClick={() => setTaskModalOpen(false)}
                className="text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A] p-2 rounded-lg transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 flex flex-col gap-5">
              {taskError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
                  {taskError}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#0A0A0A]">Nome da Tarefa *</label>
                <input 
                  type="text" 
                  value={taskName} 
                  onChange={(e) => setTaskName(e.target.value)} 
                  className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 w-full focus:ring-2 focus:ring-[#0A0A0A] outline-none text-sm transition-shadow"
                  placeholder="Ex: Implementar funcionalidade X"
                  required 
                  disabled={taskLoading}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#0A0A0A]">Descrição</label>
                <textarea 
                  value={taskDesc} 
                  onChange={(e) => setTaskDesc(e.target.value)} 
                  className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 w-full min-h-[100px] resize-y focus:ring-2 focus:ring-[#0A0A0A] outline-none text-sm transition-shadow"
                  placeholder="Descreva a tarefa..."
                  disabled={taskLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#0A0A0A]">Data de Início</label>
                  <input 
                    type="date" 
                    className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 w-full focus:ring-2 focus:ring-[#0A0A0A] outline-none text-sm transition-shadow"
                    disabled={taskLoading}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#0A0A0A]">Data de Término *</label>
                  <input 
                    type="date" 
                    value={taskDeadline} 
                    onChange={(e) => setTaskDeadline(e.target.value)} 
                    className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 w-full focus:ring-2 focus:ring-[#0A0A0A] outline-none text-sm transition-shadow"
                    required 
                    disabled={taskLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#0A0A0A]">Atribuir a</label>
                <div className="relative">
                  <select 
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg pl-3 pr-10 py-2.5 w-full focus:ring-2 focus:ring-[#0A0A0A] outline-none text-sm transition-shadow appearance-none" 
                    disabled={taskLoading}
                  >
                    <option value="">Selecione um membro</option>
                    {data?.participantes?.map(membro => (
                      <option key={membro.id} value={membro.id}>
                        {membro.name} ({membro.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-[#E5E7EB]">
                <button 
                  type="button" 
                  onClick={() => setTaskModalOpen(false)}
                  disabled={taskLoading} 
                  className="bg-white border border-[#E5E7EB] text-[#0A0A0A] font-medium rounded-lg px-5 py-2.5 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={taskLoading} 
                  className="bg-[#0A0A0A] text-white font-medium rounded-lg px-5 py-2.5 hover:bg-black transition-colors text-sm"
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
