import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil, useUsuarios, useUpdatePerfil, useAlterarSenha, useAtualizarTipoUsuario } from '../hooks/usePerfil';
import { User, Mail, Briefcase, Lock, Shield, Users, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

function TelaPerfilUsuario() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('informacoes');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [nomeEdit, setNomeEdit] = useState('');
  const [cargoEdit, setCargoEdit] = useState('');

  const { data: usuario, isLoading: isLoadingPerfil, isError: isErrorPerfil } = usePerfil();
  
  const podeGerenciarUsuarios = usuario?.role === 'ADMINISTRADOR' || usuario?.role === 'GESTOR';
  
  const { data: usuarios = [], isLoading: loadingUsuarios } = useUsuarios(
    abaAtiva === 'gerenciar' && podeGerenciarUsuarios
  );

  const updatePerfil = useUpdatePerfil();
  const updateSenha = useAlterarSenha();
  const updateTipoUsuario = useAtualizarTipoUsuario();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
  }, [navigate]);

  useEffect(() => {
    if (isErrorPerfil) {
      navigate('/login');
    }
  }, [isErrorPerfil, navigate]);

  useEffect(() => {
    if (usuario) {
      setNomeEdit(usuario.name);
      setCargoEdit(usuario.professional_role);
    }
  }, [usuario]);

  const handleSalvarPerfil = async () => {
    setMensagem(''); setErro('');
    if (!nomeEdit.trim()) { setErro('O nome não pode estar vazio.'); return; }
    updatePerfil.mutate({ name: nomeEdit, professional_role: cargoEdit }, {
      onSuccess: () => {
        setMensagem('Perfil atualizado com sucesso!');
      },
      onError: (e) => {
        setErro(e.response?.data?.error || 'Erro ao atualizar perfil.');
      }
    });
  };

  const handleAlterarSenha = async () => {
    setMensagem(''); setErro('');
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro('Preencha todos os campos.'); return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não conferem.'); return;
    }
    updateSenha.mutate({ current_password: senhaAtual, new_password: novaSenha, confirm_password: confirmarSenha }, {
      onSuccess: () => {
        setMensagem('Senha alterada com sucesso!');
        setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      },
      onError: (e) => {
        setErro(e.response?.data?.error || 'Erro ao alterar senha.');
      }
    });
  };

  const handleAtualizarTipo = async (userId, novoTipo) => {
    setMensagem(''); setErro('');
    updateTipoUsuario.mutate({ userId, novoTipo }, {
      onSuccess: () => {
        setMensagem('Tipo de usuário atualizado com sucesso!');
      },
      onError: (e) => {
        setErro(e.response?.data?.error || 'Erro ao atualizar tipo.');
      }
    });
  };

  const getTipoBadgeClass = (tipo) => {
    if (tipo === 'ADMINISTRADOR' || tipo === 'GESTOR') return 'bg-slate-900 text-white';
    return 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo) => {
    const labels = { ADMINISTRADOR: 'Administrador', GESTOR: 'Gestor', COMUM: 'Usuário Comum' };
    return labels[tipo] || tipo;
  };

  const getIniciais = (nome) => nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  const getTiposDisponiveis = () => {
    if (usuario?.role === 'ADMINISTRADOR') return ['COMUM', 'GESTOR', 'ADMINISTRADOR'];
    if (usuario?.role === 'GESTOR') return ['COMUM', 'GESTOR'];
    return [];
  };

  if (isLoadingPerfil) return <div className="bg-gray-50 min-h-screen p-8 text-gray-500 text-sm">Carregando...</div>;
  if (!usuario) return null;

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto w-full text-left">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-gray-900 font-bold text-3xl mb-2 m-0">Meu Perfil</h1>
            <p className="text-gray-500 text-sm m-0">Gerencie suas informações pessoais e configurações de segurança</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="flex items-center gap-2 bg-white border border-gray-200 text-red-600 rounded-md px-4 py-2 hover:bg-red-50 text-sm font-medium transition-colors shadow-sm"
          >
            <LogOut size={16} />
            Sair da Conta
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">
              {getIniciais(usuario.name)}
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-2xl mb-1 m-0">{usuario.name}</h2>
              <p className="text-gray-500 text-sm mb-2 m-0">{usuario.professional_role}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTipoBadgeClass(usuario.role)}`}>
                  {getTipoLabel(usuario.role)}
                </span>
                <span className="text-gray-500 text-sm">{usuario.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${abaAtiva === 'informacoes' ? 'bg-slate-900 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-200 border border-gray-200'}`} 
            onClick={() => { setAbaAtiva('informacoes'); setMensagem(''); setErro(''); }}
          >
            Informações Pessoais
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${abaAtiva === 'seguranca' ? 'bg-slate-900 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-200 border border-gray-200'}`} 
            onClick={() => { setAbaAtiva('seguranca'); setMensagem(''); setErro(''); }}
          >
            Segurança
          </button>
          {podeGerenciarUsuarios && (
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${abaAtiva === 'gerenciar' ? 'bg-slate-900 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-200 border border-gray-200'}`} 
              onClick={() => { setAbaAtiva('gerenciar'); setMensagem(''); setErro(''); }}
            >
              Gerenciar Usuários
            </button>
          )}
        </div>

        {mensagem && (
          <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4 flex items-center gap-2 text-sm">
            <CheckCircle size={18} />
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {erro}
          </div>
        )}

        {abaAtiva === 'informacoes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-gray-900 font-bold text-lg mb-1 m-0">Informações Pessoais</h3>
            <p className="text-gray-500 text-sm mb-6 m-0">Atualize suas informações de perfil</p>
            
            <div className="mb-5">
              <label className="block text-gray-900 font-bold text-sm mb-2">Nome Completo</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-none rounded-md">
                <User size={18} className="text-gray-500" />
                <input
                  type="text"
                  className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900"
                  value={nomeEdit}
                  onChange={e => setNomeEdit(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-900 font-bold text-sm mb-2">E-mail</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-none rounded-md opacity-70">
                <Mail size={18} className="text-gray-500" />
                <span className="text-sm text-gray-900">{usuario.email}</span>
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-900 font-bold text-sm mb-2">Cargo Profissional</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-none rounded-md">
                <Briefcase size={18} className="text-gray-500" />
                <input
                  type="text"
                  className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900"
                  value={cargoEdit}
                  onChange={e => setCargoEdit(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="bg-slate-900 text-white rounded-md px-4 py-2 hover:bg-slate-800 text-sm font-medium" onClick={handleSalvarPerfil}>
                Salvar Alterações
              </button>
            </div>
          </div>
        )}

        {abaAtiva === 'seguranca' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-gray-900 font-bold text-lg mb-1 m-0">Alterar Senha</h3>
            <p className="text-gray-500 text-sm mb-6 m-0">Atualize sua senha para manter sua conta segura</p>
            
            <div className="mb-5">
              <label className="block text-gray-900 font-bold text-sm mb-2">Senha Atual</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-none rounded-md">
                <Lock size={18} className="text-gray-500" />
                <input type="password" placeholder="••••••••" className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} />
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-900 font-bold text-sm mb-2">Nova Senha</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-none rounded-md">
                <Shield size={18} className="text-gray-500" />
                <input type="password" placeholder="••••••••" className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 m-0">A senha deve ter no mínimo 8 caracteres</p>
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-900 font-bold text-sm mb-2">Confirmar Nova Senha</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-none rounded-md">
                <Lock size={18} className="text-gray-500" />
                <input type="password" placeholder="••••••••" className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="bg-slate-900 text-white rounded-md px-4 py-2 hover:bg-slate-800 text-sm font-medium" onClick={handleAlterarSenha}>
                Alterar Senha
              </button>
            </div>
          </div>
        )}

        {abaAtiva === 'gerenciar' && podeGerenciarUsuarios && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-gray-900 font-bold text-lg mb-1 m-0">Gerenciar Usuários</h3>
            <p className="text-gray-500 text-sm mb-6 m-0">
              {usuario.role === 'ADMINISTRADOR'
                ? 'Como Administrador, você pode definir qualquer tipo de acesso.'
                : 'Como Gestor, você pode promover usuários até Gestor.'}
            </p>
            
            {loadingUsuarios && <div className="text-gray-500 text-sm py-4">Carregando usuários...</div>}
            
            {!loadingUsuarios && usuarios.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Users size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 m-0">Nenhum usuário encontrado.</p>
              </div>
            )}
            
            {!loadingUsuarios && usuarios.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-sm font-semibold text-gray-500">Nome</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-500">E-mail</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-500">Cargo</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-500">Tipo</th>
                      {usuario.id !== undefined && <th className="py-3 px-4 text-sm font-semibold text-gray-500">Ação</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{u.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{u.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{u.professional_role}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTipoBadgeClass(u.role)}`}>
                            {getTipoLabel(u.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {u.id !== usuario.id ? (
                            <select
                              value={u.role}
                              onChange={e => handleAtualizarTipo(u.id, e.target.value)}
                              className="bg-gray-100 border-none rounded-md px-3 py-1.5 text-sm text-gray-900 cursor-pointer outline-none focus:ring-2 focus:ring-slate-900"
                            >
                              {getTiposDisponiveis().map(tipo => (
                                <option key={tipo} value={tipo}>{getTipoLabel(tipo)}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">Você</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TelaPerfilUsuario;