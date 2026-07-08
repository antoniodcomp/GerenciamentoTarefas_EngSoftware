import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useReconfirmarSenha } from '../hooks/useAuth';

function TelaReconfirmarSenha() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const reconfirmarSenhaMutation = useReconfirmarSenha();

  let erro = '';
  if (reconfirmarSenhaMutation.isError) {
    erro = reconfirmarSenhaMutation.error.response?.data?.error || 'Erro ao redefinir a senha.';
  }

  let sucesso = '';
  if (reconfirmarSenhaMutation.isSuccess) {
    sucesso = 'Senha redefinida com sucesso! Redirecionando...';
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (novaSenha.length < 8) {
      alert('A nova senha deve conter pelo menos 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    reconfirmarSenhaMutation.mutate(
      {
        email,
        code: codigo,
        new_password: novaSenha,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        },
        onError: (error) => {
          console.error('Erro na redefinição:', error);
        }
      }
    );
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen fixed inset-0 z-[9999]">
      <header className="absolute top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 flex items-center px-6">
        <span className="font-bold text-lg text-gray-900">Sistema de Gestão</span>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md mt-10">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Redefinir Senha</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Insira o código de 6 dígitos enviado para seu e-mail e sua nova senha.
        </p>

        {erro && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200 mb-5 text-center">{erro}</div>}
        {sucesso && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-200 mb-5 text-center">{sucesso}</div>}

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
            <label className="text-sm font-medium text-slate-700">Código de Recuperação</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Digite o código de 6 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Nova Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="bg-gray-100 border-none rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button type="submit" className="bg-slate-900 text-white rounded-md py-2 px-4 hover:bg-slate-800 transition-colors w-full mt-2 font-semibold">
            Confirmar Alteração
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          Lembrou a senha? <Link to="/login" className="text-blue-600 font-medium hover:underline">Voltar para o Login</Link>
        </p>
      </div>
    </div>
  );
}

export default TelaReconfirmarSenha;
