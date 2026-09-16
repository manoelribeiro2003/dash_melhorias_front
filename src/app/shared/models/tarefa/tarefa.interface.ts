export interface Tarefa{
    id?: number;
    tempId?: string;
    nome: string;
    ordem: number;
    concluido: boolean;
    status: string;
    dataInicio: Date;
    dataTermino: Date
}