import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { reconfirmarSenha } from '../services/authService';

function TelaReconfirmarSenha() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (novaSenha.length < 8) {
      setErro('A nova senha deve conter pelo menos 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      await reconfirmarSenha({
        email,
        codigo,
        nova_senha: novaSenha,
      });
      setSucesso('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Erro na redefinição:', error);
      setErro(error.response?.data?.error || 'Erro ao redefinir a senha.');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.topbar}>
        <span style={styles.logoText}>Sistema de Gestão</span>
      </header>

      <div style={styles.card}>
        <h2 style={styles.title}>Redefinir Senha</h2>
        <p style={styles.subtitle}>
          Insira o código de 6 dígitos enviado para seu e-mail e sua nova senha.
        </p>

        {erro && <div style={styles.errorMessage}>{erro}</div>}
        {sucesso && <div style={styles.successMessage}>{sucesso}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              required
              placeholder="seuemail@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Código de Recuperação</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Digite o código de 6 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nova Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmar Nova Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Confirmar Alteração
          </button>
        </form>

        <p style={styles.footer}>
          Lembrou a senha? <Link to="/login" style={styles.link}>Voltar para o Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  topbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '24px',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#0f172a',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    border: '1px solid #e2e8f0',
    width: '100%',
    maxWidth: '420px',
    marginTop: '40px',
  },
  title: { margin: '0 0 8px 0', textAlign: 'center', color: '#0f172a', fontWeight: '600', fontSize: '24px' },
  subtitle: { margin: '0 0 32px 0', textAlign: 'center', color: '#64748b', fontSize: '14px', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#334155' },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '14px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  footer: { marginTop: '28px', textAlign: 'center', fontSize: '14px', color: '#64748b' },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: '500' },
  errorMessage: {
    color: '#e11d48',
    backgroundColor: '#ffe4e6',
    border: '1px solid #fecdd3',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  successMessage: {
    color: '#15803d',
    backgroundColor: '#dcfce7',
    border: '1px solid #bbf7d0',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
  },
};

export default TelaReconfirmarSenha;
