import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, LayoutDashboard, Bell, LogOut } from 'lucide-react';
import { usePerfil } from '../hooks/usePerfil';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: usuario } = usePerfil();

  const navItems = [
    { path: '/projetos', label: 'Projetos', icon: <Briefcase size={20} /> },
  ];

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

          <nav className="px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                    isActive
                      ? 'bg-[#0A0A0A] text-white'
                      : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
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
