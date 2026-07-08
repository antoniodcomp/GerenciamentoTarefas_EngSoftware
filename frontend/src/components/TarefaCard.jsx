import React from 'react';
import { Status } from '../constants';
import { Calendar, User, MoreVertical } from 'lucide-react';

export const TarefaCard = ({ tarefa, onClick }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case Status.CONCLUIDA:
        return 'bg-[#16A34A] text-white border-transparent'; 
      case Status.EM_ANDAMENTO:
        return 'bg-[#2563EB] text-white border-transparent';
      case Status.PENDENTE:
      default:
        return 'bg-white text-[#6B7280] border-[#E5E7EB] border';
    }
  };

  const badgeClass = getBadgeClass(tarefa.status);

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : 'cursor-default'}`}
    >
      <div className="flex-1">
        <h3 className="text-[#0A0A0A] font-bold text-[15px] mb-2">{tarefa.name}</h3>
        <div className="flex flex-wrap items-center gap-4 text-[#6B7280] text-[13px]">
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span>Sem Responsável</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{tarefa.deadline ? new Date(tarefa.deadline).toLocaleDateString('pt-BR') : '-'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${badgeClass}`}>
          {tarefa.status}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); }} 
          className="text-[#6B7280] hover:bg-gray-100 p-1 rounded-md transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};
