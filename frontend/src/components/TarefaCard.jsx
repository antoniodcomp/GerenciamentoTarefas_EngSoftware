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
      className={`bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between gap-5 h-full group ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : 'cursor-default'}`}
    >
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-slate-900 font-bold text-[17px] line-clamp-2 m-0 leading-tight group-hover:text-indigo-600 transition-colors">{tarefa.name}</h3>
          <button 
            onClick={(e) => { e.stopPropagation(); }} 
            className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-transparent border-none shrink-0"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        <p className="text-gray-500 text-[14px] line-clamp-3 mb-5 flex-1 leading-relaxed m-0">
          {tarefa.description || <span className="italic opacity-60">Sem descrição informada.</span>}
        </p>

        <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100/80">
          <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
            <User size={16} className="text-gray-400" />
            <span className="truncate">
              {tarefa.participantes && tarefa.participantes.length > 0
                ? tarefa.participantes.map(p => p.name).join(', ')
                : 'Sem Responsável'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
              <Clock size={16} className="text-gray-400" />
              <span className="text-slate-900 font-bold">{formatDate(tarefa.deadline)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-2">
        <div className="relative" onClick={e => e.stopPropagation()}>
          <select 
            value={tarefa.status} 
            onChange={handleStatusChange}
            className={`appearance-none text-[11px] font-bold px-3 py-1.5 pr-7 rounded-full border outline-none cursor-pointer transition-all bg-white ${getStatusBadge(tarefa.status)} tracking-wide`}
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="PENDENTE">PENDENTE</option>
            <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
            <option value="CONCLUIDA">CONCLUÍDA</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-60" />
        </div>
      </div>
    </div>
  );
};
