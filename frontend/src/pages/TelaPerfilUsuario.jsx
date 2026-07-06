import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TelaPerfilUsuario() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('informacoes');
  const [usuario, setUsuario] = useState(null);

  // Lê e decodifica o token JWT do localStorage para pegar os dados do usuário
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsuario({
        nome: payload.nome || 'Usuário',
        email: payload.email || '',
        cargoProfissional: payload.cargoProfissional || '',
        tipo: payload.tipo || 'COMUM',
      });
    } catch {
      navigate('/login');
    }
  }, [navigate]);

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

  const getIniciais = (nome) => {
    return nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  if (!usuario) return null;

  const podeGerenciarUsuarios = usuario.tipo === 'ADMINISTRADOR' || usuario.tipo === 'GESTOR';
  const badgeStyle = getTipoBadgeStyle(usuario.tipo);

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Meu Perfil</h1>
      <p style={styles.pageSubtitle}>Gerencie suas informações pessoais e configurações de segurança</p>

      {/* Card do cabeçalho do perfil */}
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

      {/* Cards de estatísticas */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Projetos', valor: 0 },
          { label: 'Tarefas Atribuídas', valor: 0 },
          { label: 'Tarefas Concluídas', valor: 0 },
          { label: 'Membros da Equipe', valor: 0 },
        ].map((stat) => (
          <div key={stat.label} style={styles.statCard}>
            <p style={styles.statLabel}>{stat.label}</p>
            <p style={styles.statValor}>{stat.valor}</p>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div style={styles.abasContainer}>
        <button
          style={{ ...styles.aba, ...(abaAtiva === 'informacoes' ? styles.abaAtiva : {}) }}
          onClick={() => setAbaAtiva('informacoes')}
        >
          Informações Pessoais
        </button>
        <button
          style={{ ...styles.aba, ...(abaAtiva === 'seguranca' ? styles.abaAtiva : {}) }}
          onClick={() => setAbaAtiva('seguranca')}
        >
          Segurança
        </button>
        {podeGerenciarUsuarios && (
          <button
            style={{ ...styles.aba, ...(abaAtiva === 'gerenciar' ? styles.abaAtiva : {}) }}
            onClick={() => setAbaAtiva('gerenciar')}
          >
            Gerenciar Usuários
          </button>
        )}
      </div>

      {/* Conteúdo da aba Informações Pessoais */}
      {abaAtiva === 'informacoes' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Informações Pessoais</h3>
          <p style={styles.cardSubtitle}>Atualize suas informações de perfil</p>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nome Completo</label>
            <div style={styles.fieldBox}>
              <span style={styles.fieldIcon}>👤</span>
              <span style={styles.fieldValue}>{usuario.nome}</span>
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
              <span style={styles.fieldValue}>{usuario.cargoProfissional || 'Não informado'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da aba Segurança */}
      {abaAtiva === 'seguranca' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Alterar Senha</h3>
          <p style={styles.cardSubtitle}>Atualize sua senha para manter sua conta segura</p>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Senha Atual</label>
            <div style={styles.fieldBox}>
              <span style={styles.fieldIcon}>🔒</span>
              <input type="password" placeholder="••••••••" style={styles.inputField} />
            </div>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nova Senha</label>
            <div style={styles.fieldBox}>
              <span style={styles.fieldIcon}>🔒</span>
              <input type="password" placeholder="••••••••" style={styles.inputField} />
            </div>
            <p style={styles.fieldHint}>A senha deve ter no mínimo 8 caracteres</p>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirmar Nova Senha</label>
            <div style={styles.fieldBox}>
              <span style={styles.fieldIcon}>🔒</span>
              <input type="password" placeholder="••••••••" style={styles.inputField} />
            </div>
          </div>
          <div style={styles.buttonRow}>
            <button style={styles.saveButton}>Alterar Senha</button>
          </div>
        </div>
      )}

      {/* Conteúdo da aba Gerenciar Usuários — só para Gestor e Administrador */}
      {abaAtiva === 'gerenciar' && podeGerenciarUsuarios && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Gerenciar Usuários</h3>
          <p style={styles.cardSubtitle}>Visualize e gerencie os usuários cadastrados no sistema</p>
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              A integração com o backend ainda não foi implementada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  pageTitle: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  pageSubtitle: {
    fontSize: '16px',
    margin: '0 0 30px 0',
    color: 'var(--text)',
  },
  card: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: 'var(--shadow)',
    boxSizing: 'border-box',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    flexShrink: 0,
  },
  profileName: {
    margin: '0 0 4px 0',
    fontSize: '22px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  profileCargo: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: 'var(--text)',
  },
  profileBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tipoBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  profileEmail: {
    fontSize: '14px',
    color: 'var(--text)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: 'var(--shadow)',
  },
  statLabel: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: 'var(--text)',
  },
  statValor: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-h)',
  },
  abasContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  aba: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  abaAtiva: {
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    fontWeight: '600',
    boxShadow: 'var(--shadow)',
    borderColor: 'var(--border)',
  },
  cardTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  cardSubtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: 'var(--text)',
  },
  fieldGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-h)',
    marginBottom: '8px',
  },
  fieldBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: 'var(--code-bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
  },
  fieldIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: '15px',
    color: 'var(--text-h)',
  },
  inputField: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '15px',
    color: 'var(--text-h)',
    outline: 'none',
  },
  fieldHint: {
    margin: '6px 0 0 0',
    fontSize: '12px',
    color: 'var(--text)',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  saveButton: {
    padding: '10px 24px',
    backgroundColor: 'var(--text-h)',
    color: 'var(--bg)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: 'var(--code-bg)',
    borderRadius: '8px',
    border: '1px dashed var(--border)',
  },
  emptyText: {
    fontSize: '15px',
    color: 'var(--text)',
    margin: 0,
  },
};

export default TelaPerfilUsuario;