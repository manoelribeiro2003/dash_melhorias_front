export interface IndicadorStatus {
  quantidade: number;
  valor: number;
}

export interface ResumoSupervisor {
  id: number;
  nome: string;
  totalProjetos: number;
  impactoFinanceiro: number;

  backlog: IndicadorStatus;
  andamento: IndicadorStatus;
  atrasados: IndicadorStatus;
  concluidos: IndicadorStatus;
}