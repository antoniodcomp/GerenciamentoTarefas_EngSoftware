import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjetos } from '../hooks/useProjetos';
import { usePerfil } from '../hooks/usePerfil';
import ProjetoCard from '../components/ProjetoCard';
import ProjetoModal from '../components/ProjetoModal';
import { Plus, Search, Filter } from 'lucide-react';

function TelaProjetos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMinTasks, setFilterMinTasks] = useState('');
  const [filterMaxTasks, setFilterMaxTasks] = useState('');
  const [filterMinProgress, setFilterMinProgress] = useState('');
  const [filterMaxProgress, setFilterMaxProgress] = useState('');
  const navigate = useNavigate();

  const { data: projects = [], isPending: isLoading, isError } = useProjetos();

  const { data: usuario } = usePerfil();
  const tipoUsuario = usuario?.role || usuario?.tipo;
  const podeAdicionar = tipoUsuario === 'GESTOR' || tipoUsuario === 'ADMINISTRADOR';

  const getLocalDateOnly = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr.split('T')[0] + 'T00:00:00').getTime();
  };

  const filteredProjects = projects.filter(project => {
    const term = searchTerm.toLowerCase();
    const matchesName = project.name.toLowerCase().includes(term);
    const matchesDesc = project.description ? project.description.toLowerCase().includes(term) : false;
    if (!matchesName && !matchesDesc) return false;

    if (filterStartDate) {
      const fStart = new Date(filterStartDate + 'T00:00:00').getTime();
      const pStart = getLocalDateOnly(project.startline || project.created_at);
      if (!pStart || pStart < fStart) return false;
    }

    if (filterEndDate) {
      const fEnd = new Date(filterEndDate + 'T00:00:00').getTime();
      const pEnd = getLocalDateOnly(project.deadline);
      if (!pEnd || pEnd > fEnd) return false;
    }

    const totalTasks = project.total_tasks || 0;
    if (filterMinTasks && totalTasks < parseInt(filterMinTasks, 10)) return false;
    if (filterMaxTasks && totalTasks > parseInt(filterMaxTasks, 10)) return false;

    const progress = project.progress_percentage || 0;
    if (filterMinProgress && progress < parseFloat(filterMinProgress)) return false;
    if (filterMaxProgress && progress > parseFloat(filterMaxProgress)) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden font-sans">
      {/* Decorative background for premium aesthetics */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-50/70 to-transparent -z-10"></div>
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-[80px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 m-0 tracking-tight">Projetos</h1>
            <p className="text-[15px] text-gray-500 m-0">Gerencie todos os projetos</p>
          </div>
          {podeAdicionar && (
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border-none"
            >
              <Plus size={18} /> Novo Projeto
            </button>
          )}
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-[15px] text-gray-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all placeholder-gray-400 box-border"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 border border-gray-200/60 rounded-2xl text-[15px] font-medium transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer ${showFilters ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white/80 backdrop-blur-xl text-gray-700 hover:text-gray-900 hover:bg-white'}`}
          >
            <Filter size={18} /> Filtros
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 mb-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Data de Início</label>
                  <input 
                    type="date" 
                    value={filterStartDate} 
                    onChange={(e) => setFilterStartDate(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Data de Término</label>
                  <input 
                    type="date" 
                    value={filterEndDate} 
                    onChange={(e) => setFilterEndDate(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Mín. Tarefas</label>
                  <input 
                    type="number" 
                    value={filterMinTasks} 
                    onChange={(e) => setFilterMinTasks(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Máx. Tarefas</label>
                  <input 
                    type="number" 
                    value={filterMaxTasks} 
                    onChange={(e) => setFilterMaxTasks(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Mín. Progresso (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={filterMinProgress} 
                    onChange={(e) => setFilterMinProgress(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Máx. Progresso (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={filterMaxProgress} 
                    onChange={(e) => setFilterMaxProgress(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-[15px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none border box-border text-slate-900"
                  />
                </div>
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setFilterStartDate('');
                    setFilterEndDate('');
                    setFilterMinTasks('');
                    setFilterMaxTasks('');
                    setFilterMinProgress('');
                    setFilterMaxProgress('');
                  }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer bg-white w-full sm:w-auto"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-20 text-gray-500 font-medium">Carregando projetos...</div>
        )}

        {isError && (
          <div className="bg-red-50/80 backdrop-blur-xl text-red-600 p-6 rounded-3xl border border-red-100 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            Não foi possível carregar os projetos. Verifique a conexão com o servidor.
          </div>
        )}

        {!isLoading && !isError && filteredProjects.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-16 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <p className="text-gray-500 text-[15px] mb-6 font-medium">
              {searchTerm ? 'Nenhum projeto encontrado para a sua busca.' : 'Você ainda não possui projetos cadastrados.'}
            </p>
            {!searchTerm && podeAdicionar && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-white border border-gray-200/80 text-gray-900 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-all shadow-sm font-medium text-sm cursor-pointer"
              >
                Criar Primeiro Projeto
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjetoCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <ProjetoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
}

export default TelaProjetos;
