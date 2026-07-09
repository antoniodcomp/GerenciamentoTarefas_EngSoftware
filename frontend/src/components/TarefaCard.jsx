import React from 'react';
import { Status } from '../constants';
import { Calendar, User, MoreVertical } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('pt-BR');
};

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
      className={`bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 flex flex-col justify-between gap-4 h-full ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : 'cursor-default'}`}
    >
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-[#0A0A0A] font-bold text-[15px] line-clamp-2">{tarefa.name}</h3>
          <button 
            onClick={(e) => { e.stopPropagation(); }} 
            className="text-[#6B7280] hover:bg-gray-100 p-1 rounded-md transition-colors shrink-0"
          >
            <MoreVertical size={16} />
          </button>
        </div>
        
        <p className="text-[#6B7280] text-sm line-clamp-2 mb-4 flex-1">
          {tarefa.description || <span className="italic opacity-60">Sem descrição informada.</span>}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-4 text-[#6B7280] text-[13px]">
            <div className="flex items-center gap-1.5" title="Responsável">
              <User size={14} />
              <span className="truncate max-w-[150px]">
                {tarefa.participantes && tarefa.participantes.length > 0
                  ? tarefa.participantes.map(p => p.name).join(', ')
                  : 'Sem Responsável'}
              </span>
            </div>
            <div className="flex items-center gap-1.5" title="Prazo final">
              <Calendar size={14} />
              <span className="font-medium text-[#0A0A0A]">{formatDate(tarefa.deadline)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center pt-3 border-t border-[#E5E7EB]">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${badgeClass}`}>
          {tarefa.status}
        </span>
      </div>
    </div>
  );
};
