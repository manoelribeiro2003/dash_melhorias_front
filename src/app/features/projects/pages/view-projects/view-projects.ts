import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ProjectsCard } from '../../components/projects-card/projects-card';
import { CardStatusProjects } from '../../components/card-status/card-status-projects';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { StatusProject } from '../../../../shared/enums/status.enum';

type CardValues = {
  icon: string;
  title: string;
  status?: string;
  atrasado?: boolean;
};

@Component({
  selector: 'app-view-projects',
  imports: [ProjectsCard, MatButtonModule, CardStatusProjects],
  templateUrl: './view-projects.html',
  styleUrl: './view-projects.scss',
})
export class ViewProjects {
  private projetosService = inject(ProjetoService);
  projetos = this.projetosService.projetos;

  protected readonly usuarioSelecionado = signal<number | null>(null);
  protected readonly gestorSelecionado = signal<number | null>(null);
  readonly statusSelecionado = signal<StatusProject | ''>(StatusProject.EM_ANDAMENTO);

  readonly projetosFiltrados = computed(() => {
    const usuarioId = this.usuarioSelecionado();
    const gestorId = this.gestorSelecionado();
    const status = this.statusSelecionado();

    return this.projetos().filter((projeto) => {
      const atendeUsuario = usuarioId === null || projeto.criadoPor?.id === usuarioId;

      const atendeGestor = gestorId === null || projeto.criadoPor?.gestor_id === gestorId;

      let atendeStatus = true;

      if (status === StatusProject.ATRASADO) {
        atendeStatus = projeto.atrasado;
      } else if (status) {
        atendeStatus = projeto.status === status;
      }

      return atendeUsuario && atendeGestor && atendeStatus;
    });
  });

  cardValues: CardValues[] = [
    { icon: 'totalProjetos', title: 'Total de Projetos', status: 'TotalItens' },
    { icon: 'emAndamento', title: 'Em Andamento', status: StatusProject.EM_ANDAMENTO },
    { icon: 'concluidos', title: 'Concluídos', status: StatusProject.CONCLUIDA },
    { icon: 'naoIniciados', title: 'Não Iniciados', status: StatusProject.NAO_INICIADO },
    { icon: 'atrasado', title: 'Atrasados', status: '', atrasado: true },
  ];

  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    this.iconRegistry.addSvgIcon(
      'naoIniciados',
      this.sanitizer.bypassSecurityTrustResourceUrl('dashboard/card-status/naoIniciados.svg'),
    );

    this.iconRegistry.addSvgIcon(
      'concluidos',
      this.sanitizer.bypassSecurityTrustResourceUrl('dashboard/card-status/concluidos.svg'),
    );

    this.iconRegistry.addSvgIcon(
      'emAndamento',
      this.sanitizer.bypassSecurityTrustResourceUrl('dashboard/card-status/emAndamento.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'totalProjetos',
      this.sanitizer.bypassSecurityTrustResourceUrl('dashboard/card-status/totalProjetos.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'atrasado',
      this.sanitizer.bypassSecurityTrustResourceUrl('dashboard/card-status/atrasado.svg'),
    );
  }
}
