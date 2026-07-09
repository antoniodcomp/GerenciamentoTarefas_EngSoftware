import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MoreVertical } from 'lucide-react';
import { useDeleteProjeto } from '../hooks/useProjetos';
import { usePerfil } from '../hooks/usePerfil';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('pt-BR');
};

export default function ProjetoCard({ project, onEdit }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const { mutate: deleteProjeto } = useDeleteProjeto();
  const { data: usuario } = usePerfil();

  const tipoUsuario = usuario?.role || usuario?.tipo;
  const podeExcluir = tipoUsuario === 'GESTOR' || tipoUsuario === 'ADMINISTRADOR';

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);

    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o projeto "${project.name}"? Esta ação não pode ser desfeita.`);

    if (confirmDelete) {
      deleteProjeto(project.id);
    }
  };

  useEffect(() => {                                                                                                                                               
    const handleClickOutside = (event) => {                                                                                                                       
      if (menuRef.current && !menuRef.current.contains(event.target)) {                                                                                           
        setShowMenu(false);                                                                                                                                       
      }                                                                                                                                                           
    };                                                                                                                                                            
                                                                                                                                                                  
    document.addEventListener('mousedown', handleClickOutside);                                                                                                   
    return () => {                                                                                                                                                
      document.removeEventListener('mousedown', handleClickOutside);                                                                                              
    };                                                                                                                                                            
  }, []);

  return (
    <div 
      className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-h-[280px] group"
      onClick={() => navigate(`/projetos/${project.id}/dashboard`)}
      title="Clique para ver o dashboard deste projeto"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-[#0A0A0A] text-lg line-clamp-1 flex-1 pr-2">{project.name}</h3>
        {podeExcluir && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowMenu(!showMenu); 
              }} 
              className="text-[#6B7280] hover:bg-gray-100 p-1 rounded-md transition-colors"
              title="Mais opções"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (onEdit) onEdit(project);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium border-b border-gray-100"
                >
                  Editar Projeto
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Excluir Projeto
                </button>
              </div>
            )}
          </div>
        )}
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
