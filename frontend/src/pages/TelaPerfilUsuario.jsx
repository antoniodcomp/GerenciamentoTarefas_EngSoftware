import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPerfil, alterarSenha, getUsuarios, atualizarTipoUsuario, atualizarPerfil } from '../services/api';

function TelaPerfilUsuario() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('informacoes');
  const [usuario, setUsuario] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [nomeEdit, setNomeEdit] = useState('');
  const [cargoEdit, setCargoEdit] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    getPerfil()
      .then(data => setUsuario(data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    if (abaAtiva === 'gerenciar' && usuario?.tipo !== 'COMUM') {
      setLoadingUsuarios(true);
      getUsuarios()
        .then(data => setUsuarios(data))
        .catch(() => setErro('Erro ao carregar usuários.'))
        .finally(() => setLoadingUsuarios(false));
    }
  }, [abaAtiva, usuario]);

  useEffect(() => {
    if (usuario) {
      setNomeEdit(usuario.nome);
      setCargoEdit(usuario.cargoProfissional);
    }
  }, [usuario]);

  const handleSalvarPerfil = async () => {
    setMensagem(''); setErro('');
    if (!nomeEdit.trim()) { setErro('O nome não pode estar vazio.'); return; }
    try {
      const atualizado = await atualizarPerfil({ nome: nomeEdit, cargoProfissional: cargoEdit });
      setUsuario(prev => ({ ...prev, nome: atualizado.nome, cargoProfissional: atualizado.cargoProfissional }));
      setMensagem('Perfil atualizado com sucesso!');
    } catch (e) {
      setErro(e.response?.data?.error || 'Erro ao atualizar perfil.');
      }
  };

  const handleAlterarSenha = async () => {
    setMensagem(''); setErro('');
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro('Preencha todos os campos.'); return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não conferem.'); return;
    }
    try {
      await alterarSenha({ senha_atual: senhaAtual, nova_senha: novaSenha, confirmar_senha: confirmarSenha });
      setMensagem('Senha alterada com sucesso!');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    } catch (e) {
      setErro(e.response?.data?.error || 'Erro ao alterar senha.');
    }
  };

  const handleAtualizarTipo = async (userId, novoTipo) => {
    setMensagem(''); setErro('');
    try {
      await atualizarTipoUsuario(userId, novoTipo);
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, tipo: novoTipo } : u));
      setMensagem('Tipo de usuário atualizado com sucesso!');
    } catch (e) {
      setErro(e.response?.data?.error || 'Erro ao atualizar tipo.');
    }
  };

  const getTipoBadgeStyle = (tipo) => {
    const cores = {
      ADMINISTRADOR: { bg: '#fef3c7', color: '#d97706' },
      GESTOR: { bg: '#000', color: '#fff' },
      COMUM: { bg: '#e0f2fe', color: '#0369a1' },
    };
    return cores[tipo] || cores.COMUM;
  };

  const getTipoLabel = (tipo) => {
    const labels = { ADMINISTRADOR: 'Administrador', GESTOR: 'Gestor', COMUM: 'Usuário Comum' };
    return labels[tipo] || tipo;
  };

  const getIniciais = (nome) => nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  // Opções de tipo disponíveis conforme hierarquia
  const getTiposDisponiveis = () => {
    if (usuario?.tipo === 'ADMINISTRADOR') return ['COMUM', 'GESTOR', 'ADMINISTRADOR'];
    if (usuario?.tipo === 'GESTOR') return ['COMUM', 'GESTOR'];
    return [];
  };

  if (!usuario) return null;

  const podeGerenciarUsuarios = usuario.tipo === 'ADMINISTRADOR' || usuario.tipo === 'GESTOR';
  const badgeStyle = getTipoBadgeStyle(usuario.tipo);

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Meu Perfil</h1>
      <p style={styles.pageSubtitle}>Gerencie suas informações pessoais e configurações de segurança</p>

      <div style={styles.card}>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>{getIniciais(usuario.nome)}</div>
          <div>
            <h2 style={styles.profileName}>{usuario.nome}</h2>
            <p style={styles.profileCargo}>{usuario.cargoProfissional}</p>
            <div style={styles.profileBadgeRow}>
              <span style={{ ...styles.tipoBadge, backgroundColor: badgeStyle.bg, color: badgeStyle.color }}>
                {getTipoLabel(usuario.tipo)}
              </span>
              <span style={styles.profileEmail}>{usuario.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.abasContainer}>
        <button style={{ ...styles.aba, ...(abaAtiva === 'informacoes' ? styles.abaAtiva : {}) }} onClick={() => { setAbaAtiva('informacoes'); setMensagem(''); setErro(''); }}>
          Informações Pessoais
        </button>
        <button style={{ ...styles.aba, ...(abaAtiva === 'seguranca' ? styles.abaAtiva : {}) }} onClick={() => { setAbaAtiva('seguranca'); setMensagem(''); setErro(''); }}>
          Segurança
        </button>
        {podeGerenciarUsuarios && (
          <button style={{ ...styles.aba, ...(abaAtiva === 'gerenciar' ? styles.abaAtiva : {}) }} onClick={() => { setAbaAtiva('gerenciar'); setMensagem(''); setErro(''); }}>
            Gerenciar Usuários
          </button>
        )}
      </div>

      {mensagem && <div style={styles.successMsg}>{mensagem}</div>}
      {erro && <div style={styles.errorMsg}>{erro}</div>}

      {abaAtiva === 'informacoes' && (
  <div style={styles.card}>
    <h3 style={styles.cardTitle}>Informações Pessoais</h3>
    <p style={styles.cardSubtitle}>Atualize suas informações de perfil</p>
    <div style={styles.fieldGroup}>
      <label style={styles.label}>Nome Completo</label>
      <div style={styles.fieldBox}>
        <span style={styles.fieldIcon}>👤</span>
        <input
          type="text"
          style={styles.inputField}
          value={nomeEdit}
          onChange={e => setNomeEdit(e.target.value)}
        />
      </div>
    </div>
    <div style={styles.fieldGroup}>
      <label style={styles.label}>E-mail</label>
      <div style={styles.fieldBox}>
        <span style={styles.fieldIcon}>✉️</span>
        <span style={styles.fieldValue}>{usuario.email}</span>
      </div>
    </div>
    <div style={styles.fieldGroup}>
      <label style={styles.label}>Cargo Profissional</label>
      <div style={styles.fieldBox}>
        <span style={styles.fieldIcon}>💼</span>
        <input
          type="text"
          style={styles.inputField}
          value={cargoEdit}
          onChange={e => setCargoEdit(e.target.value)}
        />
      </div>
    </div>
    <div style={styles.buttonRow}>
      <button style={styles.saveButton} onClick={handleSalvarPerfil}>Salvar Alterações</button>
    </div>
  </div>
)}

      {abaAtiva === 'seguranca' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Alterar Senha</h3>
          <p style={styles.cardSubtitle}>Atualize sua senha para manter sua conta segura</p>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Senha Atual</label>
            <div style={styles.fieldBox}>
              <span style={styles.fieldIcon}>🔒</span>
              <input type="password" placeholder="••••••••" style={styles.inputField} value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} />
            </div>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nova Senha</label>
            <div style={styles.fieldBox}>
              <span style={styles.fieldIcon}>🔒</span>
              <input type="password" placeholder="••••••••" style={styles.inputField} value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
            </div>
            <p style={styles.fieldHint}>A senha deve ter no mínimo 8 caracteres</p>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirmar Nova Senha</label>
            <div style={styles.fieldBox}>
              <span style={styles.fieldIcon}>🔒</span>
              <input type="password" placeholder="••••••••" style={styles.inputField} value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} />
            </div>
          </div>
          <div style={styles.buttonRow}>
            <button style={styles.saveButton} onClick={handleAlterarSenha}>Alterar Senha</button>
          </div>
        </div>
      )}

      {abaAtiva === 'gerenciar' && podeGerenciarUsuarios && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Gerenciar Usuários</h3>
          <p style={styles.cardSubtitle}>
            {usuario.tipo === 'ADMINISTRADOR'
              ? 'Como Administrador, você pode definir qualquer tipo de acesso.'
              : 'Como Gestor, você pode promover usuários até Gestor.'}
          </p>
          {loadingUsuarios && <p style={{ color: 'var(--text)' }}>Carregando usuários...</p>}
          {!loadingUsuarios && usuarios.length === 0 && (
            <div style={styles.emptyState}><p style={styles.emptyText}>Nenhum usuário encontrado.</p></div>
          )}
          {!loadingUsuarios && usuarios.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>E-mail</th>
                  <th style={styles.th}>Cargo</th>
                  <th style={styles.th}>Tipo</th>
                  {usuario.id !== undefined && <th style={styles.th}>Ação</th>}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.nome}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.cargoProfissional}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.tipoBadge, backgroundColor: getTipoBadgeStyle(u.tipo).bg, color: getTipoBadgeStyle(u.tipo).color }}>
                        {getTipoLabel(u.tipo)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {u.id !== usuario.id ? (
                        <select
                          value={u.tipo}
                          onChange={e => handleAtualizarTipo(u.id, e.target.value)}
                          style={styles.select}
                        >
                          {getTiposDisponiveis().map(tipo => (
                            <option key={tipo} value={tipo}>{getTipoLabel(tipo)}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text)' }}>Você</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '40px 20px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box', textAlign: 'left' },
  pageTitle: { margin: '0 0 8px 0', fontSize: '32px', fontWeight: '600', color: 'var(--text-h)' },
  pageSubtitle: { fontSize: '16px', margin: '0 0 30px 0', color: 'var(--text)' },
  card: { backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: 'var(--shadow)', boxSizing: 'border-box' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '20px' },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', flexShrink: 0 },
  profileName: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: '600', color: 'var(--text-h)' },
  profileCargo: { margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text)' },
  profileBadgeRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  tipoBadge: { fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  profileEmail: { fontSize: '14px', color: 'var(--text)' },
  abasContainer: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  aba: { padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  abaAtiva: { backgroundColor: 'var(--bg)', color: 'var(--text-h)', fontWeight: '600', boxShadow: 'var(--shadow)' },
  cardTitle: { margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-h)' },
  cardSubtitle: { margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text)' },
  fieldGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-h)', marginBottom: '8px' },
  fieldBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px' },
  fieldIcon: { fontSize: '16px', flexShrink: 0 },
  fieldValue: { fontSize: '15px', color: 'var(--text-h)' },
  inputField: { flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '15px', color: 'var(--text-h)', outline: 'none' },
  fieldHint: { margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text)' },
  buttonRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '8px' },
  saveButton: { padding: '10px 24px', backgroundColor: 'var(--text-h)', color: 'var(--bg)', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  successMsg: { padding: '12px 16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  errorMsg: { padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  emptyState: { textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--code-bg)', borderRadius: '8px', border: '1px dashed var(--border)' },
  emptyText: { fontSize: '15px', color: 'var(--text)', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text)', borderBottom: '1px solid var(--border)' },
  td: { padding: '12px', fontSize: '14px', color: 'var(--text-h)', borderBottom: '1px solid var(--border)' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-h)', fontSize: '13px', cursor: 'pointer' },
};

export default TelaPerfilUsuario;