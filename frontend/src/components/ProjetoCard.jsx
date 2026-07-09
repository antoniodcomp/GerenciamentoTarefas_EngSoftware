import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MoreHorizontal } from 'lucide-react';

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
      className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-h-[280px] group"
      onClick={() => navigate(`/projetos/${project.id}/dashboard`)}
      title="Clique para ver o dashboard deste projeto"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 flex-1 pr-2 tracking-tight group-hover:text-indigo-600 transition-colors m-0">
          {project.name}
        </h3>
        <button 
          onClick={(e) => { e.stopPropagation(); }} 
          className="text-gray-400 hover:text-gray-700 bg-transparent border-none p-1.5 rounded-xl hover:bg-gray-100/80 transition-colors cursor-pointer"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-2 mb-6 min-h-[44px] m-0">
        {project.description || <span className="italic opacity-60">Sem descrição informada.</span>}
      </p>

      {/* Status + Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2.5">
          {project.total_tasks > 0 ? (
            <span className="bg-emerald-100/80 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-[11px] uppercase tracking-wider font-bold">
              Ativo
            </span>
          ) : (
            <span className="bg-gray-100/80 text-gray-600 border border-gray-200 rounded-full px-3 py-1 text-[11px] uppercase tracking-wider font-bold">
              Inativo
            </span>
          )}
          <span className="font-bold text-gray-900 text-[15px]">{Math.round(project.progress_percentage || 0)}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden shadow-inner">
          <div 
            className="bg-slate-900 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
            style={{ width: `${project.progress_percentage || 0}%` }}
          >
             <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20"></div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="flex flex-col gap-3 mb-6 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
        <div className="flex items-center text-[13px] text-gray-500 gap-2.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Início: <span className="text-gray-900 font-semibold">{formatDate(project.startline || project.created_at)}</span></span>
        </div>
        <div className="flex items-center text-[13px] text-gray-500 gap-2.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Término: <span className="text-gray-900 font-semibold">{formatDate(project.deadline)}</span></span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 mt-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center text-[13px] text-gray-500 font-semibold gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{project.participantes?.length || 0} membros</span>
          </div>
        </div>
        <div className="text-[13px] text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
          {project.total_tasks || 0} tarefas
        </div>
      </div>
    </div>
  );
}
