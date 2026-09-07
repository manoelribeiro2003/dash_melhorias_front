import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DragDropComponent } from '../drag-drop/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';
import { Projeto } from '../../../../shared/models/projeto/projeto.interface';
import { Usuario } from '../../../../shared/models/usuario/usuario.interface';
import { Tarefa } from '../../../../shared/models/tarefa/tarefa.interface';
import { v4 as uuidv4 } from 'uuid';
import { categorias } from '../../../../shared/utils/categories';

function obterSemanaAtual(): { inicio: Date; termino: Date } {
  const inicio = new Date();

  const termino = new Date(inicio);
  termino.setDate(inicio.getDate() + 4);

  return {
    inicio,
    termino,
  };
}

@Component({
  selector: 'app-dialog-new-project',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    DragDropModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    FormsModule,
    DragDropComponent,
    MatSlideToggleModule,
  ],
  templateUrl: './dialog-new-project.html',
  styleUrl: './dialog-new-project.scss',
})
export class DialogNewProject {
  private readonly usuariosService = inject(UsuarioService);
  protected usuarios = this.usuariosService.usuarios();
  private readonly dialogRef = inject(MatDialogRef<DialogNewProject>);
  private readonly projetosService = inject(ProjetoService);

  readonly novoProjeto: Partial<Projeto> = {
    status: 'Não iniciado',
    dataInicio: obterSemanaAtual().inicio,
    dataTermino: obterSemanaAtual().termino,
    prioridade: false,
    tarefas: [
      {
        tempId: uuidv4(),
        nome: '',
        ordem: 1,
        dataInicio: new Date(),
        dataTermino: (() => {
          const data = new Date();
          data.setDate(data.getDate() + 4);
          return data;
        })(),
        concluido: false,
      },
    ],
  };

  categorias = categorias;

  compararUsuarios(usuario1: Usuario | null, usuario2: Usuario | null): boolean {
    return usuario1?.id === usuario2?.id;
  }

  atualizarTarefas(tarefas: Tarefa[]): void {
    this.novoProjeto.tarefas = tarefas;
  }

  fechar(): void {
    this.dialogRef.close();
  }

  salvarProjeto(): void {
    this.projetosService.criarProjeto(this.novoProjeto);
    console.log(this.novoProjeto);
    this.dialogRef.close();
  }

  orcamentoFormatado = '';
  formatarOrcamento(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Remove tudo que não for número
    const valor = input.value.replace(/\D/g, '');

    // Campo vazio ou valor zero
    if (!valor || Number(valor) === 0) {
      this.orcamentoFormatado = '';
      this.novoProjeto.orcamento = '0.00';
      return;
    }

    // Os dois últimos dígitos são os centavos
    const valorNumerico = Number(valor) / 100;

    // Valor exibido no input
    this.orcamentoFormatado = valorNumerico.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Valor enviado para o banco
    this.novoProjeto.orcamento = valorNumerico.toFixed(2);
  }
}
