import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistro } from '../hooks/useAuth';

function TelaCadastroUsuario() {
  const [nome, setNome]   = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const navigate = useNavigate();
  const registroMutation = useRegistro();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (senha.length < 8) {
        alert('A senha deve conter pelo menos 8 caracteres!');
        return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    registroMutation.mutate(
      { email: email, name: nome, professional_role: 'desenvolvedor', password: senha },
      {
        onSuccess: () => {
          navigate('/login');    
          alert(`Usuário ${nome} cadastrado com sucesso!`);
        },
        onError: (error) => {
          console.error('Erro de registro:', error);
          if (error.response && error.response.data) {
            const mensagens = Object.entries(error.response.data)
              .map(([campo, erros]) => {
                const mensagemErro = Array.isArray(erros) ? erros.join(', ') : String(erros);
                return `${campo}: ${mensagemErro}`;
              })
              .join('\n');
            alert(`Erro no cadastro:\n${mensagens}`);
          } else {
            alert('Não foi possível conectar ao servidor. Tente novamente.');
          }
        }
      }
    );

    console.log('Dados de Cadastro:', { nome, email, senha });
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen fixed inset-0 z-[9999]">
      <header className="absolute top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 flex items-center px-6">
        <span className="font-bold text-lg text-gray-900">Sistema de Gestão</span>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md mt-10">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Cadastrar-se</h2>
        <p className="text-sm text-gray-500 text-center mb-8">Cadastre-se para poder entrar no sistema</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Nome Completo</label>
            <input 
              type="text" required placeholder="Seu nome" value={nome}
              onChange={(e) => setNome(e.target.value)} 
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input 
              type="email" required placeholder="seuemail@dominio.com" value={email}
              onChange={(e) => setEmail(e.target.value)} 
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input 
              type="password" required placeholder="••••••••" value={senha}
              onChange={(e) => setSenha(e.target.value)} 
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Confirmar Senha</label>
            <input 
              type="password" required placeholder="••••••••" value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)} 
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          
          <button type="submit" className="bg-slate-900 text-white rounded-md py-2 px-4 hover:bg-slate-800 transition-colors w-full mt-2 font-semibold">Cadastrar</button>
        </form>
        
        <p className="mt-7 text-center text-sm text-gray-500">
            Já tem uma conta? <Link to="/login" className="text-blue-600 font-medium hover:underline">Faça Login</Link>
        </p>
      </div>
    </div>
  );
}

export default TelaCadastroUsuario;