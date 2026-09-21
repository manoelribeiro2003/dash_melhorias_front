import { StatusTasks } from "../../enums/status.enum";

export interface HistoricoTarefa {
  id: number;
  tarefaId: number;
  projetoId: number;
  nome: string;
  ordem: number;
  status: StatusTasks;
  dataInicio: Date | string | null;
  dataTermino: Date | string | null;
  criadoPorId: number;
  atualizadoPorId: number;
  excluido: boolean;
  criadoEm: Date | string;
  atualizadoEm: Date | string;
}
