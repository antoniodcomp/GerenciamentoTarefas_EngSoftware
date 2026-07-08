import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarefas } from '../hooks/useTarefas';
import { TarefaCard } from './TarefaCard';
import { AlertCircle, Loader2 } from 'lucide-react';

/**
 * Componente Container (Smart).
 * Ele se conecta ao useTarefas para buscar dados, resolver status 
 * e passa pros filhos pintarem na tela.
 */
export const TarefaList = ({ projetoId, searchTerm = '' }) => {
  const navigate = useNavigate();
  const { data: tarefas, isLoading, isError, error } = useTarefas(projetoId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 text-sm">
        <Loader2 className="animate-spin mb-2" size={24} />
        Buscando tarefas no servidor...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2">
        <AlertCircle size={20} />
        Houve um problema ao carregar as tarefas: {error?.message}
      </div>
    );
  }

  if (!tarefas || tarefas.length === 0) {
    return <div className="p-8 text-gray-500 text-sm text-center">Este projeto ainda não possui tarefas.</div>;
  }

  const filteredTarefas = tarefas.filter(tarefa => {
    const term = searchTerm.toLowerCase();
    const matchesName = tarefa.name.toLowerCase().includes(term);
    const matchesDesc = tarefa.description ? tarefa.description.toLowerCase().includes(term) : false;
    return matchesName || matchesDesc;
  });

  if (filteredTarefas.length === 0) {
    return <div className="p-8 text-gray-500 text-sm text-center">Nenhuma tarefa corresponde à sua busca.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
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
