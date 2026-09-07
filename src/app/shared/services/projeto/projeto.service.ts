import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Projeto } from '../../models/projeto/projeto.interface';
import { ProjetoJson } from '../../models/projeto/projeto-json.interface';
import { Tarefa } from '../../models/tarefa/tarefa.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjetoService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);

  private _projetos = signal<Projeto[]>([]);
  readonly projetos = this._projetos.asReadonly();

  criarProjeto(projeto: Partial<Projeto>): void {
    const dados = {
      nome: projeto.nome,
      categoria: projeto.categoria,
      status: projeto.status,
      dataInicio: projeto.dataInicio,
      dataTermino: projeto.dataTermino,
      orcamento: projeto.orcamento,
      prioridade: projeto.prioridade,
      criadoPorId: projeto.criadoPor?.id,
      tarefas: projeto.tarefas
        ?.filter((tarefa) => tarefa.nome?.trim())
        .map((tarefa, index) => ({
          nome: tarefa.nome?.trim() ?? '',
          ordem: index + 1,
          concluido: tarefa.concluido,
          dataInicio: tarefa.dataInicio,
          dataTermino: tarefa.dataTermino,
        })),
    };

    this.http.post<ProjetoJson>(`${this.apiUrl}/projetos/`, dados).subscribe({
      next: (projetoCriado) => {
        const projetoMapeado = this.mapearProjetos([projetoCriado])[0];

        this._projetos.update((projetos) => [...projetos, projetoMapeado]);
      },
      error: (erro) => {
        console.error('Erro ao criar projeto', erro);
      },
    });
  }

  carregarProjetos(): void {
    this.http.get<ProjetoJson[]>(`${this.apiUrl}/projetos/`).subscribe({
      next: (dados) => {
        this._projetos.set(this.mapearProjetos(dados));
      },
      error: (erro) => {
        console.error(erro);
      },
    });
  }

  atualizarProjeto(projeto: Projeto): void {
    const dados = {
      nome: projeto.nome,
      categoria: projeto.categoria,
      status: projeto.status,
      dataInicio: projeto.dataInicio,
      dataTermino: projeto.dataTermino,
      orcamento: projeto.orcamento,
      prioridade: projeto.prioridade,
      criadoPorId: projeto.criadoPor.id,
      tarefas: projeto.tarefas
        .filter((tarefa) => tarefa.id !== undefined || tarefa.nome?.trim())
        .map((tarefa, index) => {
          const t: Tarefa = {
            ...(tarefa.id !== undefined && { id: tarefa.id }),
            nome: tarefa.nome?.trim() ?? '',
            ordem: index + 1,
            concluido: tarefa.concluido,
            dataInicio: tarefa.dataInicio,
            dataTermino: tarefa.dataTermino,
          };
          return t;
        }),
    };

    this.http.patch<ProjetoJson>(`${this.apiUrl}/projetos/${projeto.id}`, dados).subscribe({
      next: (projetoAtualizado) => {
        const projetoMapeado = this.mapearProjetos([projetoAtualizado])[0];

        this._projetos.update((projetos) =>
          projetos.map((projeto) => (projeto.id === projetoMapeado.id ? projetoMapeado : projeto)),
        );
      },
      error: (erro) => {
        console.error(erro);
      },
    });
  }

  deletarProjeto(projeto: Projeto): void {
    this.http.delete<ProjetoJson>(`${this.apiUrl}/projetos/${projeto.id}`).subscribe({
      next: (projeto) => {
        this._projetos.update((projetos) => projetos.filter((p) => p.id !== projeto.id));
      },
      error: (erro) => {
        console.error(erro);
      },
    });
  }

  private mapearProjetos(projetos: ProjetoJson[]): Projeto[] {
    return projetos.map((projeto) => {
      const dataTermino = this.converterData(projeto.dataTermino);
      const dataInicio = this.converterData(projeto.dataInicio);
      return {
        id: projeto.id,
        nome: projeto.nome,
        categoria: projeto.categoria,
        status: projeto.status,
        dataInicio,
        dataTermino,
        orcamento: projeto.orcamento,
        prioridade: projeto.prioridade,
        criadoPor: projeto.criadoPor,
        tarefas: projeto.tarefas.map((tarefa) => ({
          nome: tarefa.nome,
          ordem: tarefa.ordem,
          concluido: tarefa.concluido,
          dataInicio: this.converterData(tarefa.dataInicio)!,
          dataTermino: this.converterData(tarefa.dataTermino)!,
          id: tarefa.id,
        })),
        tarefasConcluidas: projeto.tarefas.filter((tarefa) => tarefa.concluido).length,
        totalTarefas: projeto.tarefas.length,
        criadoEm: new Date(projeto.createdAt),
        atualizadoEm: new Date(projeto.updatedAt),
        atrasado:
          dataTermino !== null &&
          projeto.status !== 'Concluída' &&
          dataTermino < new Date(new Date().setHours(0, 0, 0, 0)),
      };
    });
  }

  private converterData(data: string | null): Date | null {
    if (!data) {
      return null;
    }
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }
}
