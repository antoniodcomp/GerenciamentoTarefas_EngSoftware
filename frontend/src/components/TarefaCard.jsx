import React from 'react';
import { Calendar, User, MoreHorizontal, Clock, ChevronDown } from 'lucide-react';
import { useUpdateTaskStatus } from '../hooks/useTarefas';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('pt-BR');
};

const getStatusBadge = (status) => {
  if (status === 'CONCLUIDA') return 'bg-emerald-100/80 text-emerald-700 border-emerald-200';
  if (status === 'EM_ANDAMENTO') return 'bg-blue-100/80 text-blue-700 border-blue-200';
  return 'bg-gray-100/80 text-gray-700 border-gray-200';
};

export const TarefaCard = ({ tarefa, onClick }) => {
  const { mutate: updateStatus } = useUpdateTaskStatus();

  const handleStatusChange = (e) => {
    e.stopPropagation();
    updateStatus({ taskId: tarefa.id, newStatus: e.target.value }, {
      onError: () => alert('Erro ao atualizar status da tarefa')
    });
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300' : 'cursor-default'}`}
    >
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="text-slate-900 font-bold text-[16px] line-clamp-1 m-0 leading-tight group-hover:text-indigo-600 transition-colors mb-1">{tarefa.name}</h3>
        <p className="text-gray-500 text-[13px] line-clamp-1 m-0">
          {tarefa.description || <span className="italic opacity-60">Sem descrição informada.</span>}
        </p>
      </div>

      <div className="flex items-center gap-6 shrink-0 flex-wrap md:flex-nowrap">
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500 max-w-[150px]">
          <User size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">
            {tarefa.participantes && tarefa.participantes.length > 0
              ? tarefa.participantes.map(p => p.name).join(', ')
              : 'Sem Responsável'}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
          <Clock size={14} className="text-gray-400 shrink-0" />
          <span className="text-slate-900 font-bold whitespace-nowrap">{formatDate(tarefa.deadline)}</span>
        </div>

        <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
          <select 
            value={tarefa.status} 
            onChange={handleStatusChange}
            className={`appearance-none text-[11px] font-bold px-3 py-1 pr-6 rounded-full border outline-none cursor-pointer transition-all bg-white ${getStatusBadge(tarefa.status)} tracking-wide`}
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="PENDENTE">PENDENTE</option>
            <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
            <option value="CONCLUIDA">CONCLUÍDA</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); }} 
          className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-transparent border-none hidden md:block shrink-0"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};
