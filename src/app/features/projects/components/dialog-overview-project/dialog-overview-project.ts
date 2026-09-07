import { Component, inject, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { DragDropComponent } from '../drag-drop/drag-drop';
import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';
import { Projeto } from '../../../../shared/models/projeto/projeto.interface';
import { Tarefa } from '../../../../shared/models/tarefa/tarefa.interface';
import { Usuario } from '../../../../shared/models/usuario/usuario.interface';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { groupBy } from '../../../../shared/utils/group-by';
import { categorias } from '../../../../shared/utils/categories';

@Component({
  selector: 'app-dialog-project',
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
  ],
  templateUrl: './dialog-overview-project.html',
  styleUrl: './dialog-overview-project.scss',
})
export class DialogOverviewProject {
  private readonly dialogRef = inject(MatDialogRef<DialogOverviewProject>);
  private readonly data = inject<Projeto>(MAT_DIALOG_DATA);
  private readonly projetosService = inject(ProjetoService);
  private readonly usuariosService = inject(UsuarioService);

  readonly usuarios = this.usuariosService.usuarios();
  protected readonly projetos = this.projetosService.projetos();

  // protected readonly categorias = Array.from(
  //   groupBy(this.projetos, (projeto) => projeto.categoria).keys(),
  // );

  categorias = categorias;

  readonly projetoRecebido: Projeto = {
    ...this.data,
  };

  atualizarTarefas(tarefas: Tarefa[]): void {
    this.projetoRecebido.tarefas = tarefas;
  }

  salvarProjeto(): void {
    this.dialogRef.close(this.projetoRecebido);
  }

  fechar(): void {
    this.dialogRef.close();
  }

  compararUsuarios(usuario1: Usuario | null, usuario2: Usuario | null): boolean {
    return usuario1?.id === usuario2?.id;
  }

  orcamentoFormatado = '';
  formatarOrcamento(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Remove tudo que não for número
    const valor = input.value.replace(/\D/g, '');

    // Campo vazio ou valor zero
    if (!valor || Number(valor) === 0) {
      this.orcamentoFormatado = '';
      this.projetoRecebido.orcamento = '0.00';
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
    this.projetoRecebido.orcamento = valorNumerico.toFixed(2);
  }

  ngOnInit(): void {
    if (this.projetoRecebido.orcamento) {
      const valor = Number(this.projetoRecebido.orcamento);

      this.orcamentoFormatado = valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }
}
