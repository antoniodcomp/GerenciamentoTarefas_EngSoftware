import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupFakeAuth } from './services/authMock'

// Inicializa a autenticação simulada para desenvolvimento local
setupFakeAuth();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
