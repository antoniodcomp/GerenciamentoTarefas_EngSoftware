import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MoreVertical } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('pt-BR');
};

export default function ProjetoCard({ project }) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col min-h-[260px]"
      onClick={() => navigate(`/projetos/${project.id}/dashboard`)}
      title="Clique para ver o dashboard deste projeto"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-[#0A0A0A] text-lg line-clamp-1 flex-1 pr-2">{project.name}</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); }} 
          className="text-[#6B7280] hover:bg-gray-100 p-1 rounded-md transition-colors"
        >
          <MoreVertical size={20} />
        </button>
      </div>
      
      <p className="text-[#6B7280] text-sm line-clamp-2 mb-6 min-h-[40px]">
        {project.description || <span className="italic opacity-60">Sem descrição informada.</span>}
      </p>

      {/* Status + Progress */}
      <div className="flex justify-between items-center mb-2">
        <span className="bg-[#16A34A] text-white rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wide font-bold">
          Ativo
        </span>
        <span className="font-bold text-[#0A0A0A] text-sm">65%</span>
      </div>
      <div className="bg-[#E5E7EB] rounded-full h-1.5 w-full mb-6 overflow-hidden">
        <div className="bg-[#2563EB] h-full rounded-full" style={{ width: '65%' }}></div>
      </div>

      {/* Dates */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center text-sm text-[#6B7280] gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Início: <span className="text-[#0A0A0A] font-medium">{formatDate(project.startline || project.created_at)}</span></span>
        </div>
        <div className="flex items-center text-sm text-[#6B7280] gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Fim: <span className="text-[#0A0A0A] font-medium">{formatDate(project.deadline)}</span></span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E5E7EB] pt-4 mt-auto flex justify-between items-center">
        <div className="flex items-center text-sm text-[#6B7280] font-medium gap-1.5">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{project.participantes?.length || 0} membros</span>
        </div>
        <div className="text-sm text-[#6B7280] font-medium">
          -/- tarefas
        </div>
      </div>
    </div>
  );
}
