import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TelaProjetos from './pages/TelaProjetos'
import TelaCadastroProjeto from './pages/TelaCadastroProjeto'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Roda raiz redireciona para a lista de projetos */}
        <Route path="/" element={<Navigate to="/projetos" replace />} />
        
        {/* Rota para listar projetos */}
        <Route path="/projetos" element={<TelaProjetos />} />
        
        {/* Rota para criar um novo projeto */}
        <Route path="/projetos/novo" element={<TelaCadastroProjeto />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
