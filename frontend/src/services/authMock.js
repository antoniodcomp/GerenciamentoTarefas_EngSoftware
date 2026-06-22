export const setupFakeAuth = () => {
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'fake-jwt-token-desenvolvimento');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      username: 'gestor',
      email: 'gestor@exemplo.com',
      role: 'GESTOR'
    }));
    console.log('🔒 Mock de autenticação ativado: Usuário "gestor" logado.');
  }
};
