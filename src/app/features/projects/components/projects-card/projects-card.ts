import { Component, computed, input, model, signal } from '@angular/core';
import { ProjectCategories } from '../../../../shared/enums/projects-category.enum';
import { StatusProject } from '../../../../shared/enums/status.enum';
import { Usuario } from '../../../../shared/models/usuario/usuario.interface';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TableProjects } from '../table-projects/table-projects';

type StatusFiltro = StatusProject | 'PRIORIDADE' | '';

@Component({
  selector: 'app-projects-card',
  templateUrl: './projects-card.html',
  styleUrl: './projects-card.scss',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    TableProjects,
  ],
})
export class ProjectsCard {
  // =========================================================
  // Filtros compartilhados com o componente pai
  // =========================================================

  readonly usuarioSelecionado = model<number | null>(null);
  readonly gestorSelecionado = model<number | null>(null);
  readonly statusSelecionado = model<StatusFiltro>('PRIORIDADE');
  readonly categoriaSelecionada = model<ProjectCategories | ''>('');

  // =========================================================
  // Opções recebidas do ViewProjects
  // =========================================================

  readonly categorias = input.required<ProjectCategories[]>();
  readonly usuarios = input.required<Usuario[]>();
  readonly gestores = input.required<{ id: number; nome: string }[]>();
  readonly status = input.required<{ label: string; value: StatusFiltro }[]>();

  // =========================================================
  // Pesquisa do responsável
  // =========================================================

  readonly pesquisaUsuario = signal('');

  readonly usuariosFiltrados = computed(() => {
    const pesquisa = this.pesquisaUsuario().trim().toLowerCase();

    return this.usuarios().filter((usuario) => usuario.nome.toLowerCase().includes(pesquisa));
  });

  // =========================================================
  // Ações
  // =========================================================

  alterarPesquisaUsuario(valor: string): void {
    this.pesquisaUsuario.set(valor);
  }

  limparUsuario(event: Event): void {
    event.stopPropagation();

    this.usuarioSelecionado.set(null);
    this.pesquisaUsuario.set('');
  }
}
