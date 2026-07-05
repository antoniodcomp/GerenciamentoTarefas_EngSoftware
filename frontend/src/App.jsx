import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TelaProjetos from './pages/TelaProjetos'
import TelaCadastroProjeto from './pages/TelaCadastroProjeto'
import TelaDashboard from './pages/TelaDashboard'
import TelaDetalhesTarefa from './pages/TelaDetalhesTarefa'
import TelaLogin from './pages/TelaLogin' // <-- Seu Import
import TelaCadastroUsuario from './pages/TelaCadastroUsuario' // <-- Seu Import
import TelaReconfirmarSenha from './pages/TelaReconfirmarSenha'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raizredireciona para o Login*/}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/*rotas de Autenticação*/}
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/cadastro" element={<TelaCadastroUsuario />} />
        <Route path="/reconfirmar-senha" element={<TelaReconfirmarSenha />} />

        
        {/* Rotas de Projetos*/}
        <Route path="/projetos" element={<TelaProjetos />} />
        <Route path="/projetos/novo" element={<TelaCadastroProjeto />} />
        <Route path="/projetos/:id/dashboard" element={<TelaDashboard />} />
        <Route path="/projetos/:projectId/tarefas/:taskId" element={<TelaDetalhesTarefa />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App