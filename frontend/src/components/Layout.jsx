import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, LayoutDashboard, Bell, LogOut, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { usePerfil } from '../hooks/usePerfil';
import { useProjetos } from '../hooks/useProjetos';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: usuario } = usePerfil();
  const { data: projects = [] } = useProjetos();
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F7F7F8] overflow-hidden font-sans text-[#0A0A0A]">
      {/* Sidebar Lateral */}
      <aside className="w-[280px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
            <div className="text-[#0A0A0A] font-bold text-lg">
              <span>Sistema de Gestão</span>
            </div>
          </div>

          <nav className="px-4 py-6 space-y-2 flex-1 overflow-y-auto">
            <Link
              to="/projetos"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                location.pathname === '/projetos'
                  ? 'bg-[#0A0A0A] text-white'
                  : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A]'
              }`}
            >
              <Briefcase size={20} />
              <span className="flex-1">Projetos</span>
              <button 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setIsProjectsOpen(!isProjectsOpen); 
                }}
                className={`p-0.5 rounded-md transition-colors ${location.pathname === '/projetos' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
              >
                {isProjectsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            </Link>

            {isProjectsOpen && projects.length > 0 && (
              <div className="pl-5 space-y-1 mt-1 border-l-2 border-gray-100 ml-4">
                {projects.map((project) => {
                  const projectPath = `/projetos/${project.id}/dashboard`;
                  const isActive = location.pathname.startsWith(`/projetos/${project.id}`);
                  return (
                    <Link
                      key={project.id}
                      to={projectPath}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[13px] ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A]'
                      }`}
                      title={project.name}
                    >
                      <Folder size={14} className={`shrink-0 ${isActive ? "text-indigo-500" : "text-gray-400"}`} />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-[#E5E7EB] flex items-center gap-2">
          {/* Card do Usuário (Link para o Perfil) */}
          <Link 
            to="/perfil" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex-1 min-w-0"
          >
            <div className="h-10 w-10 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold shrink-0">
              {usuario?.name ? usuario.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold text-[#0A0A0A] truncate">
                {usuario?.name || 'Carregando...'}
              </span>
              <span className="text-xs text-[#6B7280] truncate">
                {usuario?.role || 'Gestor'}
              </span>
            </div>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair da Conta"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Conteúdo Dinâmico da Página */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
