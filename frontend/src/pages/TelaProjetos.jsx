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
    <div className="bg-[#F7F7F8] min-h-screen p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A0A] mb-2 m-0">Projetos</h1>
          <p className="text-sm text-[#6B7280] m-0">Gerencie todos os projetos</p>
        </div>
        {podeAdicionar && (
          <button onClick={() => setIsModalOpen(true)} className="bg-[#0A0A0A] text-white rounded-md px-4 py-2 hover:bg-black flex items-center gap-2 font-medium text-sm transition-colors">
            <Plus size={16} /> Novo Projeto
          </button>
        )}
      </div>

      <div className="mb-8 flex gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 pl-10 w-full focus:ring-2 focus:ring-[#0A0A0A] outline-none text-sm transition-shadow"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-white text-[#0A0A0A] hover:bg-gray-50 text-sm font-medium transition-colors">
          <Filter size={16} /> Filtros
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-gray-600">Carregando projetos...</div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 text-center">
          Não foi possível carregar os projetos. Verifique a conexão com o servidor.
        </div>
      )}

      {!isLoading && !isError && filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Nenhum projeto encontrado para a sua busca.' : 'Você ainda não possui projetos cadastrados.'}
          </p>
          {!searchTerm && podeAdicionar && (
            <button onClick={() => setIsModalOpen(true)} className="bg-white border border-gray-200 text-gray-900 rounded-md px-4 py-2 hover:bg-gray-50">
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
  );
}

export default TelaProjetos;
