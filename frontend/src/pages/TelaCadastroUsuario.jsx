import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

function TelaCadastroUsuario() {
  const [nome, setNome]   = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro]   = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setErro('');
    e.preventDefault();
    
    if (senha.length < 8) {
        alert('A senha deve conter pelo menos 6 caracteres!');
        return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const response = await register({ email: email, 
                                        nome: nome, 
                                        cargoProfissional: 'desenvolvedor',
                                         password: senha });
      navigate('/login');    
      alert(`Usuário ${nome} cadastrado com sucesso!`);
    } catch (error) {
      console.error('Erro de registro:', error);
      if (error.response && error.response.data) {
        // Concatena as mensagens de erro retornadas pela API (ex: e-mail já cadastrado)
        const mensagens = Object.entries(error.response.data)
          .map(([campo, erros]) => {
            const mensagemErro = Array.isArray(erros) ? erros.join(', ') : String(erros);
            return `${campo}: ${mensagemErro}`;
          })
          .join('\n');
        setErro(mensagens);
        alert(`Erro no cadastro:\n${mensagens}`);
      } else {
        setErro('Não foi possível conectar ao servidor. Tente novamente.');
      }

    }

    console.log('Dados de Cadastro:', { nome, email, senha });
  };

  return (
    <div style={styles.container}>
      <header style={styles.topbar}>
        <span style={styles.logoText}>Sistema de Gestão</span>
      </header>

      <div style={styles.card}>
        <h2 style={styles.title}>Cadastrar-se</h2>
        <p style={styles.subtitle}>Cadastre-se para poder entrar no sistema</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome Completo</label>
            <input 
              type="text" required placeholder="Seu nome" value={nome}
              onChange={(e) => setNome(e.target.value)} style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input 
              type="email" required placeholder="seuemail@dominio.com" value={email}
              onChange={(e) => setEmail(e.target.value)} style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input 
              type="senha" required placeholder="••••••••" value={senha}
              onChange={(e) => setSenha(e.target.value)} style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmar Senha</label>
            <input 
              type="senha" required placeholder="••••••••" value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)} style={styles.input}
            />
          </div>
          
          <button type="submit" style={styles.button}>Cadastrar</button>
        </form>
        
        <p style={styles.footer}>
            Já tem uma conta? <Link to="/login" style={styles.link}>Faça Login</Link>
        </p>
      </div>
    </div>
  );
}

// Reaproveitando os mesmos estilos do login
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
    borderRadius: '12px', // Bordas arredondadas do padrão do protótipo
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', // Sombra super leve
    border: '1px solid #e2e8f0',
    width: '100%', 
    maxWidth: '420px',
    marginTop: '40px'
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
    transition: 'border-color 0.2s'
  },
  button: { 
    padding: '14px', 
    backgroundColor: '#0f172a', // Tom escuro do menu do protótipo
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
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: '500' } // Azul das barras de progresso
};

export default TelaCadastroUsuario;