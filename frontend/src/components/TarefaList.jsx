import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarefas } from '../hooks/useTarefas';
import { TarefaCard } from './TarefaCard';

/**
 * Componente Container (Smart).
 * Ele se conecta ao useTarefas para buscar dados, resolver status 
 * e passa pros filhos pintarem na tela.
 */
export const TarefaList = ({ projetoId }) => {
  const navigate = useNavigate();
  const { data: tarefas, isLoading, isError, error } = useTarefas(projetoId);

  if (isLoading) {
    return <div style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>Buscando tarefas no servidor...</div>;
  }

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
        <TarefaCard 
          key={tarefa.id} 
          tarefa={tarefa} 
          onClick={() => navigate(`/projetos/${projetoId}/tarefas/${tarefa.id}`)}
        />
      ))}
    </div>
  );
};
