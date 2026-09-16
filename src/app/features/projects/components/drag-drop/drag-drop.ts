import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Tarefa } from '../../../../shared/models/tarefa/tarefa.interface';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { v4 as uuidv4 } from 'uuid';
import { StatusTasks } from '../../../../shared/enums/status.enum';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

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
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
  ],
})
export class DragDropComponent {
  readonly tarefas = input.required<Tarefa[]>();

  readonly tarefasEnviadas = output<Tarefa[]>();
  readonly ranges = new Map<string, RangeForm>();

  protected readonly statusTarefas = StatusTasks;

  constructor() {
    effect(() => {
      const tarefas = this.tarefas();
      this.sincronizarRanges(tarefas);
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
     * Remove os formulários de tarefas que
     * não existem mais na lista.
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

    this.atualizarTarefa(tarefa, { dataInicio: data });
  }

  // ============================================================
  // ATUALIZAR DATA DE TÉRMINO
  // ============================================================

  atualizarDataTermino(tarefa: Tarefa, data: Date | null): void {
    if (!data) {
      return;
    }

    this.atualizarTarefa(tarefa, { dataTermino: data });
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

      return mesmaTarefa ? { ...tarefa, ...alteracoes } : tarefa;
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
}
