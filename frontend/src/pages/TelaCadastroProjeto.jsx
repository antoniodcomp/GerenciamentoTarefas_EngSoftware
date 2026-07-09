import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProjeto } from '../hooks/useProjetos';
import { usePerfil, useUsuarios } from '../hooks/usePerfil';
import { X, Calendar as CalendarIcon } from 'lucide-react';

function TelaCadastroProjeto() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startline, setStartline] = useState('');
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState('');
  const [participantes, setParticipantes] = useState([]);
  const [buscarUsuario, setBuscarUsuario] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const createProjetoMutation = useCreateProjeto();
  const loading = createProjetoMutation.isPending;
  const error = formError;

  const { data: usuario, isPending: carregandoPerfil } = usePerfil();
  const tipoUsuario = usuario?.role || usuario?.tipo;
  const { data: todosUsuarios = [] } = useUsuarios(!!usuario);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const usuariosFiltrados = todosUsuarios.filter(u =>
    u.id !== usuario?.id &&
    !participantes.find(p => p.id === u.id) &&
    (
      (u.name || '').toLowerCase().includes(buscarUsuario.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(buscarUsuario.toLowerCase())
    )
  );

  const adicionarParticipante = (user) => {
    setParticipantes(prev => [...prev, user]);
    setBuscarUsuario('');
    setMostrarDropdown(false);
  };

  const removerParticipante = (userId) => {
    setParticipantes(prev => prev.filter(p => p.id !== userId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('O nome do projeto é obrigatório.');
      return;
    }
    if (!deadline) {
      setFormError('O prazo final do projeto é obrigatório.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (deadline < todayStr) {
      setFormError('O prazo final não pode ser uma data no passado.');
      return;
    }

    setFormError('');

    const projectData = {
      name: name.trim(),
      description: description.trim() || null,
      startline: startline || null,
      deadline,
      participantes: participantes.map(p => p.id),
    };

    createProjetoMutation.mutate(projectData, {
      onSuccess: () => {
        navigate('/projetos');
      },
      onError: (err) => {
        console.error(err);
        
        if (err.response && err.response.data) {
          const backendErrors = err.response.data;
          if (typeof backendErrors === 'object') {
            const messages = Object.entries(backendErrors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
              .join(' | ');
            setFormError(messages || 'Erro ao cadastrar o projeto. Verifique os dados.');
          } else {
            setFormError('Ocorreu um erro no servidor. Tente novamente mais tarde.');
          }
        } else {
          setFormError('Não foi possível conectar ao servidor. Tente novamente.');
        }
      }
    });
  };

  if (carregandoPerfil) {
    return <div className="bg-[#F7F7F8] min-h-screen p-8 text-center text-[#6B7280]">Verificando permissões...</div>;
  }

  if (usuario && tipoUsuario !== 'GESTOR' && tipoUsuario !== 'ADMINISTRADOR') {
    return (
      <div className="bg-[#F7F7F8] min-h-screen p-8 flex flex-col items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200 max-w-md w-full text-center shadow-sm">
          <strong>Acesso Negado:</strong> Apenas Gestores e Administradores podem cadastrar novos projetos.
        </div>
        <button onClick={() => navigate('/projetos')} className="mt-6 bg-white border border-[#E5E7EB] text-[#0A0A0A] rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors font-medium">
          Voltar para Meus Projetos
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F8] min-h-screen p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-[#0A0A0A] m-0">Criar Novo Projeto</h2>
            <p className="text-sm text-[#6B7280] m-0 mt-1">Preencha as informações do projeto</p>
          </div>
          <button 
            onClick={() => navigate('/projetos')}
            className="text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A] p-2 rounded-lg transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-bold text-[#0A0A0A]">Nome do Projeto <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              placeholder="Ex: Sistema de Vendas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-bold text-[#0A0A0A]">Descrição</label>
            <textarea
              id="description"
              placeholder="Descreva o objetivo do projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 min-h-[100px] resize-y focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
              rows="4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="startline" className="text-sm font-bold text-[#0A0A0A]">Data de Início</label>
              <input
                type="date"
                id="startline"
                value={startline}
                onChange={(e) => setStartline(e.target.value)}
                disabled={loading}
                className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="deadline" className="text-sm font-bold text-[#0A0A0A]">Data de Término <span className="text-red-500">*</span></label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={loading}
                className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
                required
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#0A0A0A]">Adicionar Participantes</label>

            {participantes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1">
                {participantes.map(p => (
                  <span key={p.id} className="flex items-center gap-1 bg-[#0A0A0A] text-white text-xs font-medium px-3 py-1 rounded-full">
                    {p.name}
                    <button type="button" onClick={() => removerParticipante(p.id)} className="ml-1 hover:text-red-300 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={buscarUsuario}
                onChange={(e) => { setBuscarUsuario(e.target.value); setMostrarDropdown(true); }}
                onFocus={() => setMostrarDropdown(true)}
                disabled={loading}
                className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
              />

              {mostrarDropdown && buscarUsuario && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {usuariosFiltrados.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-[#6B7280]">Nenhum usuário encontrado.</div>
                  ) : (
                    usuariosFiltrados.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => adicionarParticipante(u)}
                        className="w-full text-left px-4 py-3 hover:bg-[#F3F4F6] transition-colors border-b border-[#E5E7EB] last:border-0"
                      >
                        <p className="text-sm font-medium text-[#0A0A0A]">{u.name}</p>
                        <p className="text-xs text-[#6B7280]">{u.email} · {u.professional_role}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {participantes.length === 0 && (
              <p className="text-xs text-[#6B7280]">Você será adicionado automaticamente como gestor do projeto.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => navigate('/projetos')}
              disabled={loading}
              className="bg-white border border-[#E5E7EB] text-[#0A0A0A] font-medium rounded-lg px-5 py-2.5 hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0A0A0A] text-white font-medium rounded-lg px-5 py-2.5 hover:bg-black transition-colors text-sm"
            >
              {loading ? 'Salvando...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TelaCadastroProjeto;
