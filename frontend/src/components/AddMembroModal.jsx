import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUsuarios } from '../hooks/useUsuarios';
import { useUpdateProjeto } from '../hooks/useProjetos';
import { X, Search } from 'lucide-react';

export default function AddMembroModal({ isOpen, onClose, projectId, currentParticipantes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [localError, setLocalError] = useState('');

  const { data: usuarios = [], isLoading: loadingUsuarios } = useUsuarios();
  const updateMutation = useUpdateProjeto();

  // Reset e inicialização
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const initialIds = currentParticipantes.map(p => p.id);
      setSelectedIds(initialIds);
      setSearchTerm('');
      setLocalError('');
      
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, currentParticipantes, onClose]);

  if (!isOpen) return null;

  const filteredUsuarios = usuarios.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleUsuario = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setLocalError('');
    updateMutation.mutate({
      projectId,
      data: { participantes: selectedIds }
    }, {
      onSuccess: () => {
        onClose();
      },
      onError: (err) => {
        setLocalError('Erro ao atualizar membros. Tente novamente.');
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0A0A0A] m-0">Gerenciar Equipe</h2>
            <p className="text-sm text-[#6B7280] m-0 mt-1">Adicione ou remova membros do projeto</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#6B7280] hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Busca e Lista */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {localError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm">
              {localError}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 pl-9 w-full focus:ring-2 focus:ring-[#0A0A0A] outline-none text-sm transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {loadingUsuarios ? (
              <p className="text-sm text-gray-500 text-center py-4">Carregando usuários...</p>
            ) : filteredUsuarios.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum usuário encontrado.</p>
            ) : (
              filteredUsuarios.map(user => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <label 
                    key={user.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      isSelected ? 'border-[#0A0A0A] bg-gray-50' : 'border-[#E5E7EB] hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleUsuario(user.id)}
                      className="w-4 h-4 rounded text-[#0A0A0A] focus:ring-[#0A0A0A] accent-[#0A0A0A]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0A0A0A] text-sm truncate">{user.name}</p>
                      {user.email && <p className="text-xs text-[#6B7280] truncate">{user.email}</p>}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E5E7EB] flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="bg-white border border-[#E5E7EB] text-[#0A0A0A] font-medium rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || loadingUsuarios}
            className="bg-[#0A0A0A] text-white font-medium rounded-lg px-5 py-2 hover:bg-black transition-colors text-sm"
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Equipe'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
