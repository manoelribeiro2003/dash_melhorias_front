import { inject, Injectable, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HistoricoTarefa } from '../../models/historico/historico-tarefa.interface';
import { HistoricoProjeto } from '../../models/historico/historico-projeto.interface';

@Injectable({
  providedIn: 'root',
})
export class Historico {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private readonly _historicoTarefas = signal<Map<number, HistoricoTarefa[]>>(new Map());
  private readonly _historicoProjetos = signal<Map<number, HistoricoProjeto[]>>(new Map());

  readonly historicoTarefas = this._historicoTarefas.asReadonly();
  readonly historicoProjetos = this._historicoProjetos.asReadonly();

  public carregarHistoricoTarefas(idsTarefas: number[]): void {
    if (!idsTarefas.length) {
      this._historicoTarefas.set(new Map());
      return;
    }
    const requisicoes = idsTarefas.map((idTarefa) =>
      this.http.get<HistoricoTarefa[]>(`${this.apiUrl}/historico/tarefa/${idTarefa}`),
    );
    forkJoin(requisicoes).subscribe({
      next: (historicos) => {
        const mapa = new Map<number, HistoricoTarefa[]>();

        historicos.forEach((historico, index) => {
          mapa.set(idsTarefas[index], historico);
        });

        this._historicoTarefas.set(mapa);
      },

      error: (erro) => {
        console.error('Erro ao carregar histórico das tarefas:', erro);
      },
    });
  }

  public carregarHistoricoProjeto(idProjeto: number): void {
    this.http.get<HistoricoProjeto[]>(`${this.apiUrl}/historico/projeto/${idProjeto}`).subscribe({
      next: (historico) => {
        this._historicoProjetos.update((mapa) => {
          const novoMapa = new Map(mapa);

          novoMapa.set(idProjeto, historico);

          return novoMapa;
        });
      },
      error: (erro) => {
        console.error('Erro ao carregar histórico do projeto:', erro);
      },
    });
  }

  public limparHistorico(): void {
    this._historicoTarefas.set(new Map());
  }
}
