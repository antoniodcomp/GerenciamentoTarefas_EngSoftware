/**
 * Enumerações que refletem o Diagrama de Classes do Backend
 */
export enum TipoUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  GESTOR = 'GESTOR',
  COMUM = 'COMUM'
}

export enum Status {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA'
}

/**
 * Interface que representa a entidade Usuario
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargoProfissional: string;
  tipo: TipoUsuario;
}

/**
 * Interface que representa a entidade Tarefa
 */
export interface Tarefa {
  id: number;
  nome: string;
  descricao: string;
  dataInicio?: string;
  dataFim: string;
  status: Status;
  responsavel?: Usuario;
}
