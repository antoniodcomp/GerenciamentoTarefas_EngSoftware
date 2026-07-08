import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin, useSolicitarCodigoRecuperacao } from '../hooks/useAuth';

function TelaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const loginMutation = useLogin();
  const solicitarCodigoMutation = useSolicitarCodigoRecuperacao();

  let erro = '';
  if (loginMutation.isError) {
    if (loginMutation.error.response && loginMutation.error.response.status === 401) {
      erro = 'E-mail ou senha incorretos.';
    } else {
      erro = 'Erro inesperado, checar console';
    }
  } else if (solicitarCodigoMutation.isError) {
    erro = solicitarCodigoMutation.error.response?.data?.error || 'Erro ao enviar código de recuperação.';
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados de Login:', { email, senha });

    loginMutation.mutate({ email, password: senha }, {
      onSuccess: (response) => {
        localStorage.setItem('token', response.access);
        navigate('/projetos');
      },
      onError: (error) => {
        console.error('Erro de login:', error);
      }
    });
  };

  const handleForgotPassword = () => {
    if (!email) {
      alert('Por favor, informe seu e-mail no campo acima antes de solicitar a recuperação.');
      return;
    }
    
    solicitarCodigoMutation.mutate(email, {
      onSuccess: () => {
        navigate('/reconfirmar-senha', { state: { email } });
      },
      onError: (error) => {
        console.error(error);
      }
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.topbar}>
        <span style={styles.logoText}>Sistema de Gestão</span>
      </header>

      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <p style={styles.subtitle}>Insira suas credenciais para entrar no sistema</p>

        {erro && <div style={styles.errorMessage}>{erro}</div>}
        
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
            <div style={styles.labelRow}>
              <label style={styles.label}>Senha</label>
              <span onClick={handleForgotPassword} style={styles.forgotPassword}>
                Esqueci minha senha?
              </span>
            </div>
            <input 
              type="password" 
              required
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <button type="submit" style={styles.button}>Entrar no Sistema</button>
        </form>
        
        <p style={styles.footer}>
          Novo por aqui? <Link to="/cadastro" style={styles.link}>Faça seu cadastro!</Link>
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
    zIndex: 9999
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
    color: '#0f172a'
  },
  card: { 
    backgroundColor: '#ffffff', 
    padding: '40px', 
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    border: '1px solid #e2e8f0',
    width: '100%', 
    maxWidth: '420px',
    marginTop: '40px'
  },
  title: { margin: '0 0 8px 0', textAlign: 'center', color: '#0f172a', fontWeight: '600', fontSize: '24px' },
  subtitle: { margin: '0 0 32px 0', textAlign: 'center', color: '#64748b', fontSize: '14px', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: '14px', fontWeight: '500', color: '#334155' },
  forgotPassword: {
    fontSize: '13px',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.2s',
    userSelect: 'none',
  },
  input: { 
    padding: '12px 16px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    fontSize: '15px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.2s'
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
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
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
  }
};

export default TelaLogin;