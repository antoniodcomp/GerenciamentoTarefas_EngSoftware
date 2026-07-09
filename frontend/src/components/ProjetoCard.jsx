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

export default function ProjetoCard({ project }) {
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
      className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col min-h-[260px]"
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
      
      <p className="text-[#6B7280] text-sm line-clamp-2 mb-6 min-h-[40px]">
        {project.description || <span className="italic opacity-60">Sem descrição informada.</span>}
      </p>

      {/* Status + Progress */}
      <div className="flex justify-between items-center mb-2">
        <span className="bg-[#16A34A] text-white rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wide font-bold">
          Ativo
        </span>
        <span className="font-bold text-[#0A0A0A] text-sm">{Math.round(project.progress_percentage || 0)}%</span>
      </div>
      <div className="bg-[#E5E7EB] rounded-full h-1.5 w-full mb-6 overflow-hidden">
        <div className="bg-[#2563EB] h-full rounded-full transition-all duration-300" style={{ width: `${project.progress_percentage || 0}%` }}></div>
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
          {project.total_tasks || 0} tarefas
        </div>
      </div>
    </div>
  );
}
