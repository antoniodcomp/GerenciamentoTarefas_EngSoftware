import React from 'react';
import { useTarefas } from '../hooks/useTarefas';
import { TarefaCard } from './TarefaCard';

interface TarefaListProps {
  projetoId: number;
}

/**
 * Componente Container (Smart Component).
 * Ele se conecta aos Hooks (React Query) para buscar dados e repassa 
 * para os componentes filhos (visuais). 
 * Isola completamente a camada de UI da camada de requisições de rede.
 */
export const TarefaList: React.FC<TarefaListProps> = ({ projetoId }) => {
  // O hook abstrai o axios e o gerenciamento de estados
  const { data: tarefas, isLoading, isError, error } = useTarefas(projetoId);

  // UI para o estado de carregamento do React Query
  if (isLoading) {
    return <div style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>Buscando tarefas no servidor...</div>;
  }

  // UI para lidar com falhas de rede (abstraídas do componente principal)
  if (isError) {
    return (
      <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
        Houve um problema ao carregar as tarefas: {error?.message}
      </div>
    );
  }

  if (!tarefas || tarefas.length === 0) {
    return <div style={{ padding: '20px', color: '#6b7280' }}>Este projeto ainda não possui tarefas.</div>;
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '16px',
      padding: '20px 0' 
    }}>
      {tarefas.map((tarefa) => (
        // Repassa os dados para o componente puro que não sabe nada sobre API
        <TarefaCard key={tarefa.id} tarefa={tarefa} />
      ))}
    </div>
  );
};
