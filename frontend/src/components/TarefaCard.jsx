import React from 'react';
import { Status } from '../constants';

/**
 * Componente Puro (Presentational).
 * Apenas desenha a UI baseada nos dados recebidos, sem regras de negócio ou rede.
 */
export const TarefaCard = ({ tarefa }) => {
  const getBadgeStyle = (status) => {
    switch (status) {
      case Status.CONCLUIDA:
        return { backgroundColor: '#d1fae5', color: '#065f46' }; // Verde
      case Status.EM_ANDAMENTO:
        return { backgroundColor: '#fef3c7', color: '#92400e' }; // Amarelo
      default:
        return { backgroundColor: '#dbeafe', color: '#1e40af' }; // Azul
    }
  };

  const badgeStyle = getBadgeStyle(tarefa.status);

  return (
    <div style={{
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>{tarefa.nome}</h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
        {tarefa.descricao || 'Sem descrição informada.'}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          ...badgeStyle
        }}>
          {tarefa.status}
        </span>
        
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          Prazo: {tarefa.dataFim ? new Date(tarefa.dataFim).toLocaleDateString('pt-BR') : '-'}
        </span>
      </div>
    </div>
  );
};
