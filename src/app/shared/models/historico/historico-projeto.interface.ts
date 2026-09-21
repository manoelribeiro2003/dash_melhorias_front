export interface HistoricoProjeto {
  id: number;
  projetoId: number;
  nome: string;
  categoria: string;
  dataInicio: string | null;
  dataTermino: string | null;
  excluido: boolean;
  ganhoPar: number | null;
  orcamento: string | null;
  prioridade: boolean;
  status: string;
  criadoPorId: number;
  atualizadoPorId: number;
  gestorId: number;
  createdAt: string;
  updatedAt: string;
}
