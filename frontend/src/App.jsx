import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TelaProjetos from './pages/TelaProjetos'
import TelaCadastroProjeto from './pages/TelaCadastroProjeto'
import TelaDashboard from './pages/TelaDashboard'
import TelaDetalhesTarefa from './pages/TelaDetalhesTarefa'
import TelaLogin from './pages/TelaLogin'
import TelaCadastroUsuario from './pages/TelaCadastroUsuario'
import TelaReconfirmarSenha from './pages/TelaReconfirmarSenha'
import TelaPerfilUsuario from './pages/TelaPerfilUsuario'
import ProtectedRoute from './components/ProtegeRota'
import Layout from './components/Layout'
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

        
        {/* Rotas de Projetos Protegidas com Layout (Sidebar + Topbar) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/projetos" element={<TelaProjetos />} />
            <Route path="/projetos/novo" element={<TelaCadastroProjeto />} />
            <Route path="/projetos/:id/dashboard" element={<TelaDashboard />} />
            <Route path="/projetos/:projectId/tarefas/:taskId" element={<TelaDetalhesTarefa />} />
            <Route path="/perfil" element={<TelaPerfilUsuario />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App