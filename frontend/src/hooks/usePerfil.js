import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPerfil, getUsuarios, atualizarPerfil, alterarSenha, atualizarTipoUsuario } from '../services/authService';

export const usePerfil = () => {
  return useQuery({
    queryKey: ['perfil'],
    queryFn: getPerfil,
    retry: false
  });
};

export const useUsuarios = (enabled) => {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
    enabled,
  });
};

export const useUpdatePerfil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: atualizarPerfil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] });
    },
  });
};

export const useAlterarSenha = () => {
  return useMutation({
    mutationFn: alterarSenha,
  });
};

export const useAtualizarTipoUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, novoTipo }) => atualizarTipoUsuario(userId, novoTipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};
