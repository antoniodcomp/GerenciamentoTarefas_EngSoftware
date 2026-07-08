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
    <div className="bg-gray-50 flex items-center justify-center min-h-screen fixed inset-0 z-[9999]">
      <header className="absolute top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 flex items-center px-6">
        <span className="font-bold text-lg text-gray-900">Sistema de Gestão</span>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md mt-10">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Login</h2>
        <p className="text-sm text-gray-500 text-center mb-8">Insira suas credenciais para entrar no sistema</p>

        {erro && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200 mb-5 text-center">{erro}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input 
              type="email" 
              required
              placeholder="seuemail@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <span onClick={handleForgotPassword} className="text-sm text-blue-600 cursor-pointer font-medium hover:text-blue-700 transition-colors select-none">
                Esqueci minha senha?
              </span>
            </div>
            <input 
              type="password" 
              required
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          
          <button type="submit" className="bg-slate-900 text-white rounded-md py-2 px-4 hover:bg-slate-800 transition-colors w-full mt-2 font-semibold">Entrar no Sistema</button>
        </form>
        
        <p className="mt-7 text-center text-sm text-gray-500">
          Novo por aqui? <Link to="/cadastro" className="text-blue-600 font-medium hover:underline">Faça seu cadastro!</Link>
        </p>
      </div>
    </div>
  );
}

export default TelaLogin;