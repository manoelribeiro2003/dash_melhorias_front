import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TableProjects } from '../table-projects/table-projects';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';
import { categorias } from '../../../../shared/utils/categories';

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
      value: 'Em andamento',
      label: 'Em Andamento',
    },
    {
      value: 'Concluída',
      label: 'Concluidos',
    },
    {
      value: 'Não iniciado',
      label: 'Não Iniciados',
    },
    {
      value: 'Atrasado',
      label: 'Atrasados',
    },
  ]);
  protected readonly categorias = categorias;
  protected readonly usuarios = this.usuariosService.usuarios;

  catSelecionada = model('');
  statusSelecionado = model(null);
  readonly usuarioSelecionado = model<number | null>(null);
}
