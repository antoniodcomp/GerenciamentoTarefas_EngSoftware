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
  const navigate = useNavigate();

  const { data: projects = [], isPending: isLoading, isError } = useProjetos();

  const { data: usuario } = usePerfil();
  const tipoUsuario = usuario?.role || usuario?.tipo;
  const podeAdicionar = tipoUsuario === 'GESTOR' || tipoUsuario === 'ADMINISTRADOR';

  const filteredProjects = projects.filter(project => {
    const term = searchTerm.toLowerCase();
    const matchesName = project.name.toLowerCase().includes(term);
    const matchesDesc = project.description ? project.description.toLowerCase().includes(term) : false;
    return matchesName || matchesDesc;
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
          <button className="flex items-center gap-2 px-5 py-3 border border-gray-200/60 rounded-2xl bg-white/80 backdrop-blur-xl text-gray-700 hover:text-gray-900 hover:bg-white text-[15px] font-medium transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer">
            <Filter size={18} /> Filtros
          </button>
        </div>

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
