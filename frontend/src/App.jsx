import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TelaProjetos from './pages/TelaProjetos'
import TelaCadastroProjeto from './pages/TelaCadastroProjeto'
import TelaLogin from './pages/TelaLogin' // <-- Seu Import
import TelaCadastroUsuario from './pages/TelaCadastroUsuario' // <-- Seu Import
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz agora redireciona para o Login por segurança */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Novas rotas de Autenticação que você criou */}
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/cadastro" element={<TelaCadastroUsuario />} />
        
        {/* Rotas de Projetos do seu colega */}
        <Route path="/projetos" element={<TelaProjetos />} />
        <Route path="/projetos/novo" element={<TelaCadastroProjeto />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App