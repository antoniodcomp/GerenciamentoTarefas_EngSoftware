import { useMutation } from '@tanstack/react-query';
import { 
  login, 
  register, 
  solicitarCodigoRecuperacao, 
  reconfirmarSenha 
} from '../services/authService';

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useRegistro = () => {
  return useMutation({
    mutationFn: register,
  });
};

export const useSolicitarCodigoRecuperacao = () => {
  return useMutation({
    mutationFn: solicitarCodigoRecuperacao,
  });
};

export const useReconfirmarSenha = () => {
  return useMutation({
    mutationFn: reconfirmarSenha,
  });
};
