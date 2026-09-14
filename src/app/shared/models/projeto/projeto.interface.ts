import { Tarefa } from '../tarefa/tarefa.interface';
import { Usuario } from '../usuario/usuario.interface';

export interface Projeto {
  id: number;
  nome: string;
  categoria: string;
  status: string;
  dataInicio: Date | null;
  dataTermino: Date | null;
  orcamento: string | null;
  prioridade: boolean;
  criadoPor: Usuario;
  gestor: Usuario;
  tarefas: Tarefa[];
  tarefasConcluidas: number;
  totalTarefas: number;
  atrasado: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
