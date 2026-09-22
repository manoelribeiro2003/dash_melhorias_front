import { Component, computed, inject, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TableProjects } from '../table-projects/table-projects';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProjectCategories } from '../../../../shared/enums/projects-category.enum';
import { StatusProject } from '../../../../shared/enums/status.enum';

interface Status {
  value: string;
  label: string;
}

@Component({
  selector: 'app-projects-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    TableProjects,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './projects-card.html',
  styleUrl: './projects-card.scss',
})
export class ProjectsCard {
  private readonly usuariosService = inject(UsuarioService);
  protected readonly status = signal<Status[]>([
    {
      value: '',
      label: 'Todos',
    },
    {
      value: StatusProject.EM_ANDAMENTO,
      label: 'Em Andamento',
    },
    {
      value: StatusProject.CONCLUIDA,
      label: 'Concluidos',
    },
    {
      value: StatusProject.NAO_INICIADO,
      label: 'Não Iniciados',
    },
    {
      value: StatusProject.ATRASADO,
      label: 'Atrasados',
    },
  ]);
  protected readonly categorias = Object.values(ProjectCategories).sort();
  protected readonly usuarios = this.usuariosService.usuarios;
  protected readonly gestores = this.usuariosService.gestores;
  protected readonly catSelecionada = model('');
  readonly statusSelecionado = model<StatusProject | ''>(StatusProject.EM_ANDAMENTO);

  // -------------------------Pesquisa de usuario------------------------------
  readonly usuarioSelecionado = model<number | null>(null);
  readonly gestorSelecionado = model<number | null>(null);

  protected readonly pesquisaUsuario = signal('');
  protected readonly usuariosFiltrados = computed(() => {
    const termo = this.pesquisaUsuario().toLowerCase().trim();

    const resultado = this.usuarios().filter((usuario) =>
      usuario.nome.toLowerCase().includes(termo),
    );

    return resultado;
  });

  protected alterarPesquisaUsuario(valor: string): void {
    this.pesquisaUsuario.set(valor);
  }

  protected limparUsuario(event: MouseEvent): void {
    event.stopPropagation();
    this.usuarioSelecionado.set(null);
  }
  // ----------------------------------------------------------------------------------
}
