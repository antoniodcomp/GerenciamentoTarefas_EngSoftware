import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCreateProjeto } from '../hooks/useProjetos';
import { usePerfil } from '../hooks/usePerfil';
import { X } from 'lucide-react';

export default function ProjetoModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startline, setStartline] = useState('');
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState('');

  const createProjetoMutation = useCreateProjeto();
  const loading = createProjetoMutation.isPending;

  const { data: usuario, isPending: carregandoPerfil } = usePerfil();
  const tipoUsuario = usuario?.role || usuario?.tipo;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('O nome do projeto é obrigatório.');
      return;
    }
    if (!deadline) {
      setFormError('O prazo final do projeto é obrigatório.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (deadline < todayStr) {
      setFormError('O prazo final não pode ser uma data no passado.');
      return;
    }

    setFormError('');

    createProjetoMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
      startline: startline || null,
      deadline,
    }, {
      onSuccess: () => {
        setName('');
        setDescription('');
        setStartline('');
        setDeadline('');
        onClose();
      },
      onError: (err) => {
        console.error(err);
        if (err.response && err.response.data) {
          const backendErrors = err.response.data;
          if (typeof backendErrors === 'object') {
            const messages = Object.entries(backendErrors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
              .join(' | ');
            setFormError(messages || 'Erro ao cadastrar o projeto. Verifique os dados.');
          } else {
            setFormError('Ocorreu um erro no servidor. Tente novamente mais tarde.');
          }
        } else {
          setFormError('Não foi possível conectar ao servidor. Tente novamente.');
        }
      }
    });
  };

  if (carregandoPerfil) return null;

  // Apenas GESTOR ou ADMINISTRADOR
  if (usuario && tipoUsuario !== 'GESTOR' && tipoUsuario !== 'ADMINISTRADOR') {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-4">
            <strong>Acesso Negado:</strong> Apenas Gestores e Administradores podem cadastrar novos projetos.
          </div>
          <button onClick={onClose} className="bg-white border border-[#E5E7EB] text-[#0A0A0A] rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors font-medium">
            Fechar
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-[#0A0A0A] m-0">Criar Novo Projeto</h2>
            <p className="text-sm text-[#6B7280] m-0 mt-1">Preencha as informações do projeto</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#6B7280] hover:bg-gray-100 hover:text-[#0A0A0A] p-2 rounded-lg transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {formError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-bold text-[#0A0A0A]">Nome do Projeto <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              placeholder="Ex: Sistema de Vendas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-bold text-[#0A0A0A]">Descrição</label>
            <textarea
              id="description"
              placeholder="Descreva o objetivo do projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 min-h-[100px] resize-y focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
              rows="4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="startline" className="text-sm font-bold text-[#0A0A0A]">Data de Início</label>
              <input
                type="date"
                id="startline"
                value={startline}
                onChange={(e) => setStartline(e.target.value)}
                disabled={loading}
                className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="deadline" className="text-sm font-bold text-[#0A0A0A]">Data de Término <span className="text-red-500">*</span></label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={loading}
                className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#0A0A0A] outline-none w-full text-sm transition-shadow"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-white border border-[#E5E7EB] text-[#0A0A0A] font-medium rounded-lg px-5 py-2.5 hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0A0A0A] text-white font-medium rounded-lg px-5 py-2.5 hover:bg-black transition-colors text-sm"
            >
              {loading ? 'Salvando...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
