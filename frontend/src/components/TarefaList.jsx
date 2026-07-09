import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarefas } from '../hooks/useTarefas';
import { TarefaCard } from './TarefaCard';
import { AlertCircle, Loader2 } from 'lucide-react';

export const TarefaList = ({ projetoId, searchTerm = '' }) => {
  const navigate = useNavigate();
  const { data: tarefas, isLoading, isError, error } = useTarefas(projetoId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500 text-[15px]">
        <Loader2 className="animate-spin mb-3 text-indigo-500" size={32} />
        Buscando tarefas no servidor...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 bg-red-50/80 backdrop-blur-xl rounded-2xl border border-red-200 flex items-center gap-3 shadow-sm">
        <AlertCircle size={24} className="shrink-0" />
        Houve um problema ao carregar as tarefas: {error?.message}
      </div>
    );
  }

  if (!tarefas || tarefas.length === 0) {
    return <div className="p-12 text-gray-500 text-[15px] text-center bg-white/50 border border-dashed border-gray-300 rounded-3xl">Este projeto ainda não possui tarefas.</div>;
  }

  const filteredTarefas = tarefas.filter(tarefa => {
    const term = searchTerm.toLowerCase();
    const matchesName = tarefa.name.toLowerCase().includes(term);
    const matchesDesc = tarefa.description ? tarefa.description.toLowerCase().includes(term) : false;
    return matchesName || matchesDesc;
  });

  if (filteredTarefas.length === 0) {
    return <div className="p-12 text-gray-500 text-[15px] text-center bg-white/50 border border-dashed border-gray-300 rounded-3xl">Nenhuma tarefa corresponde à sua busca.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-2">
      {filteredTarefas.map((tarefa) => (
        <TarefaCard 
          key={tarefa.id} 
          tarefa={tarefa} 
          onClick={() => navigate(`/projetos/${projetoId}/tarefas/${tarefa.id}`)}
        />
      ))}
    </div>
  );
};
