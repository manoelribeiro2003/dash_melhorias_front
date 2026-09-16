import { Component, computed, inject, model, signal } from '@angular/core';
import { CardStatusTasks } from '../../components/card-status/card-status';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { groupBy } from '../../../../shared/utils/group-by';
import { Projeto } from '../../../../shared/models/projeto/projeto.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UserFilterComponent } from '../../../../shared/components/user-filter/user-filter';
import { StatusProject as status, StatusProject } from '../../../../shared/enums/status.enum';

type CardValues = {
  icon: string;
  title: string;
  status?: string;
  atrasado?: boolean;
};

type PessoaProjetos = {
  nome: string;
  projetos: Projeto[];
};

const materialModules = [
  MatTableModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatPaginatorModule,
  MatDividerModule,
  MatDialogModule,
  MatSortModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatButtonModule,
];
const angularModules = [DatePipe, CommonModule, FormsModule];

@Component({
  selector: 'app-view-tasks',
  imports: [
    materialModules,
    angularModules,
    NgxMatSelectSearchModule,
    CardStatusTasks,
    UserFilterComponent,
  ],
  templateUrl: './view-tasks.html',
  styleUrl: './view-tasks.scss',
})
export class ViewTasks {
  private readonly projetosService = inject(ProjetoService);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly usuariosService = inject(UsuarioService);

  protected readonly usuarios = this.usuariosService.usuarios;
  protected readonly gestores = this.usuariosService.gestores;
  protected readonly gestorSelecionado = model<number | null>(null);
  protected readonly usuarioSelecionado = model<number | null>(null);

  protected readonly statusProjeto = StatusProject;

  // ====================== Filtros e inicialização dos projetos da semana ============================
  protected hoje = new Date();
  protected segunda: Date = (() => {
    const segunda = new Date();
    segunda.setDate(this.hoje.getDate() + (this.hoje.getDay() === 0 ? -6 : 1 - this.hoje.getDay()));
    segunda.setHours(0, 0, 0, 0);
    return segunda;
  })();

  protected sabado: Date = (() => {
    const sabado = new Date(this.segunda);
    sabado.setDate(this.segunda.getDate() + 5);
    sabado.setHours(23, 59, 59, 999);
    return sabado;
  })();
  // --------------------------------------- Atribuição do array de projetos----------------------------
  readonly projetos = computed<Projeto[]>(() => {
    const gestorId = this.gestorSelecionado();
    const projetos = this.projetosService.projetos();

    return projetos
      .map((projeto) => ({
        ...projeto,
        tarefas: projeto.tarefas.filter((tarefa) => {
          const dataTermino = new Date(tarefa.dataTermino);

          if (tarefa.concluido) {
            return dataTermino > this.segunda && dataTermino <= this.sabado;
          }

          return dataTermino <= this.sabado;
        }),
      }))
      .filter(
        (projeto) => projeto.status !== status.CONCLUIDA && projeto.status !== status.NAO_INICIADO,
      )
      .filter((projeto) => gestorId === null || projeto.criadoPor?.gestor_id === gestorId);
  });

  // ====================== Data Source da Tabela ============================
  private readonly projetosPorNome = computed(() =>
    groupBy(this.projetos(), (projeto) => projeto.criadoPor.nome),
  );
  protected readonly dataSource = computed<PessoaProjetos[]>(() =>
    Array.from(this.projetosPorNome().entries()).map(([nome, projetos]) => ({
      nome,
      projetos,
    })),
  );

  // ====================== Dados dos valores dos Cards ============================
  protected readonly tarefas = computed(() =>
    this.dataSource().flatMap((pessoaProjeto) =>
      pessoaProjeto.projetos.flatMap((projeto) =>
        projeto.tarefas.map((tarefa) => ({
          ...tarefa,
          projetoNome: projeto.nome,
        })),
      ),
    ),
  );

  protected readonly indicadores = computed(() =>
    this.tarefas().reduce(
      (acc, tarefa) => {
        acc.total++;
        if (tarefa.concluido) {
          acc.concluidas++;
        } else {
          acc.emAndamento++;
          if (tarefa.dataTermino < this.segunda) {
            acc.atrasadas++;
          }
        }
        return acc;
      },
      {
        total: 0,
        concluidas: 0,
        atrasadas: 0,
        emAndamento: 0,
      },
    ),
  );

  // ===============================================================================
  protected readonly cardValues: CardValues[] = [
    { icon: 'totalProjetos', title: 'Total de Entregáveis', status: 'TotalItens' },
    { icon: 'emAndamento', title: 'Em Andamento', status: status.EM_ANDAMENTO },
    { icon: 'concluidos', title: 'Concluídas', status: status.CONCLUIDA },
    // { icon: 'naoIniciados', title: 'Não Iniciadas', status: 'Não iniciado' },
    { icon: 'atrasado', title: 'Atrasadas', status: '', atrasado: true },
  ];

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
