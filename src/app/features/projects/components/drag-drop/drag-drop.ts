import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { Component, computed, effect, inject, input, output } from '@angular/core';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { v4 as uuidv4 } from 'uuid';

import { Tarefa } from '../../../../shared/models/tarefa/tarefa.interface';
import { StatusTasks } from '../../../../shared/enums/status.enum';
import { HistoricoTarefa } from '../../../../shared/models/historico/historico-tarefa.interface';
import { Historico } from '../../../../shared/services/historico/historico.service';

type RangeForm = FormGroup<{
  start: FormControl<Date | null>;
  end: FormControl<Date | null>;
}>;

@Component({
  selector: 'app-drag-drop',
  templateUrl: 'drag-drop.html',
  styleUrl: 'drag-drop.scss',
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatOptionModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class DragDropComponent {
  // ============================================================
  // INPUTS / OUTPUTS
  // ============================================================

  readonly tarefas = input.required<Tarefa[]>();

  readonly tarefasEnviadas = output<Tarefa[]>();

  // ============================================================
  // SERVIÇOS
  // ============================================================

  readonly historicoService = inject(Historico);

  readonly historicoTarefas = this.historicoService.historicoTarefas;

  // ============================================================
  // PROPRIEDADES
  // ============================================================

  readonly ranges = new Map<string, RangeForm>();

  protected readonly statusTarefas = StatusTasks;

  private idsTarefasHistoricoCarregado = '';

  // ============================================================
  // HISTÓRICO DE PRAZO
  // ============================================================

  readonly alteracoesPrazo = computed(() => {
    const resultado = new Map<number, HistoricoTarefa[]>();

    for (const [tarefaId, historico] of this.historicoTarefas()) {
      const historicosValidos = historico
        .filter((item) => !item.excluido)
        .slice()
        .sort((a, b) => a.id - b.id);

      const alteracoes: HistoricoTarefa[] = [];

      for (let i = 0; i < historicosValidos.length; i++) {
        const atual = historicosValidos[i];

        if (i === 0) {
          alteracoes.push(atual);
          continue;
        }

        const anterior = historicosValidos[i - 1];

        const dataInicioAlterada =
          this.normalizarData(anterior.dataInicio) !== this.normalizarData(atual.dataInicio);

        const dataTerminoAlterada =
          this.normalizarData(anterior.dataTermino) !== this.normalizarData(atual.dataTermino);

        if (dataInicioAlterada || dataTerminoAlterada) {
          alteracoes.push(atual);
        }
      }

      if (alteracoes.length) {
        resultado.set(tarefaId, alteracoes);
      }
    }

    return resultado;
  });
  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor() {
    effect(() => {
      const tarefas = this.tarefas();

      this.sincronizarRanges(tarefas);

      this.carregarHistoricoTarefas(tarefas);
    });
  }

  // ============================================================
  // IDENTIDADE DA TAREFA
  // ============================================================

  private getTarefaKey(tarefa: Tarefa): string {
    if (tarefa.id !== undefined) {
      return `id-${tarefa.id}`;
    }

    if (tarefa.tempId !== undefined) {
      return `temp-${tarefa.tempId}`;
    }

    throw new Error('A tarefa precisa possuir id ou tempId.');
  }

  // ============================================================
  // RANGE
  // ============================================================

  private criarRange(tarefa: Tarefa): RangeForm {
    return new FormGroup({
      start: new FormControl<Date | null>(tarefa.dataInicio),

      end: new FormControl<Date | null>(tarefa.dataTermino),
    });
  }

  private sincronizarRanges(tarefas: Tarefa[]): void {
    const chavesAtuais = new Set<string>();

    for (const tarefa of tarefas) {
      const key = this.getTarefaKey(tarefa);

      chavesAtuais.add(key);

      if (!this.ranges.has(key)) {
        this.ranges.set(key, this.criarRange(tarefa));
      }
    }

    /**
     * Remove os formulários das tarefas
     * que não existem mais na lista.
     */
    for (const key of this.ranges.keys()) {
      if (!chavesAtuais.has(key)) {
        this.ranges.delete(key);
      }
    }
  }

  getRange(tarefa: Tarefa): RangeForm {
    return this.ranges.get(this.getTarefaKey(tarefa))!;
  }

  // ============================================================
  // ATUALIZAR DATA DE INÍCIO
  // ============================================================

  atualizarDataInicio(tarefa: Tarefa, data: Date | null): void {
    if (!data) {
      return;
    }

    this.atualizarTarefa(tarefa, {
      dataInicio: data,
    });
  }

  // ============================================================
  // ATUALIZAR DATA DE TÉRMINO
  // ============================================================

  atualizarDataTermino(tarefa: Tarefa, data: Date | null): void {
    if (!data) {
      return;
    }

    this.atualizarTarefa(tarefa, {
      dataTermino: data,
    });
  }

  // ============================================================
  // ATUALIZAR TAREFA
  // ============================================================

  atualizarTarefa(tarefaAtualizada: Tarefa, alteracoes: Partial<Tarefa>): void {
    const tarefasAtualizadas = this.tarefas().map((tarefa) => {
      const mesmaTarefa =
        tarefaAtualizada.id !== undefined
          ? tarefa.id === tarefaAtualizada.id
          : tarefa.tempId === tarefaAtualizada.tempId;

      return mesmaTarefa
        ? {
            ...tarefa,
            ...alteracoes,
          }
        : tarefa;
    });

    this.tarefasEnviadas.emit(tarefasAtualizadas);
  }

  // ============================================================
  // DRAG AND DROP
  // ============================================================

  drop(event: CdkDragDrop<Tarefa[]>): void {
    const tarefas = this.tarefas().map((tarefa) => ({
      ...tarefa,
    }));

    moveItemInArray(tarefas, event.previousIndex, event.currentIndex);

    const tarefasAtualizadas = tarefas.map((tarefa, index) => ({
      ...tarefa,
      ordem: index + 1,
    }));

    this.tarefasEnviadas.emit(tarefasAtualizadas);
  }

  // ============================================================
  // ADICIONAR TAREFA
  // ============================================================

  adicionarTarefa(): void {
    const tarefas = this.tarefas();

    const dataInicio = new Date();

    const dataTermino = new Date(dataInicio);

    dataTermino.setDate(dataTermino.getDate() + 4);

    const novaTarefa: Tarefa = {
      tempId: uuidv4(),
      ordem: tarefas.length + 1,
      nome: '',
      concluido: false,
      status: StatusTasks.NAO_INICIADA,
      dataInicio,
      dataTermino,
    };

    const tarefasAtualizadas = [...tarefas, novaTarefa];

    this.tarefasEnviadas.emit(tarefasAtualizadas);
  }

  // ============================================================
  // EXCLUIR TAREFA
  // ============================================================

  excluirTarefa(tarefaExcluir: Tarefa): void {
    const tarefas = this.tarefas().filter((tarefa) => {
      if (tarefaExcluir.id !== undefined) {
        return tarefa.id !== tarefaExcluir.id;
      }

      return tarefa.tempId !== tarefaExcluir.tempId;
    });

    const tarefasAtualizadas = tarefas.map((tarefa, index) => ({
      ...tarefa,
      ordem: index + 1,
    }));

    this.tarefasEnviadas.emit(tarefasAtualizadas);
  }

  // ============================================================
  // HISTÓRICO
  // ============================================================

  private carregarHistoricoTarefas(tarefas: Tarefa[]): void {
    const idsTarefas = tarefas
      .map((tarefa) => tarefa.id)
      .filter((id): id is number => id !== undefined)
      .sort((a, b) => a - b);

    /**
     * Não há tarefas persistidas.
     */
    if (!idsTarefas.length) {
      return;
    }

    const chaveAtual = idsTarefas.join(',');

    /**
     * Evita fazer novamente as mesmas requisições
     * quando o signal tarefas mudar apenas porque
     * uma propriedade da tarefa foi alterada.
     */
    if (chaveAtual === this.idsTarefasHistoricoCarregado) {
      return;
    }

    this.idsTarefasHistoricoCarregado = chaveAtual;

    this.historicoService.carregarHistoricoTarefas(idsTarefas);
  }

  // ============================================================
  // DATAS
  // ============================================================

  private normalizarData(data: Date | string | null | undefined): string | null {
    if (!data) {
      return null;
    }

    if (typeof data === 'string') {
      return data.split('T')[0];
    }

    const ano = data.getFullYear();

    const mes = String(data.getMonth() + 1).padStart(2, '0');

    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  formatarData(data: Date | string | null | undefined): string {
    const valor = this.normalizarData(data);

    if (!valor) {
      return '-';
    }

    const [ano, mes, dia] = valor.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  formatarAlteracoesPrazo(tarefaId: number): string {
    const alteracoes = this.alteracoesPrazo().get(tarefaId);

    if (!alteracoes?.length) {
      return '';
    }

    return [
      'Alterações:',
      ...alteracoes.map(
        (alteracao, index) =>
          `${index + 1}º ${this.formatarData(alteracao.dataInicio)} - ${this.formatarData(alteracao.dataTermino)}`,
      ),
    ].join('\n');
  }
}
