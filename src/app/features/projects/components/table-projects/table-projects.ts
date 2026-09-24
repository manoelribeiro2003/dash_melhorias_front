import { AfterViewInit, Component, effect, inject, input, ViewChild } from '@angular/core';
import { NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { DialogOverviewProject } from '../dialog-overview-project/dialog-overview-project';
import { ConfirmDialogComponent } from '../dialog-delete-project/confirm-dialog';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { Projeto } from '../../../../shared/models/projeto/projeto.interface';
import { StatusProject, StatusTasks } from '../../../../shared/enums/status.enum';

type StatusFiltro = StatusProject | 'PRIORIDADE' | '';

@Component({
  selector: 'app-table-projects',
  imports: [
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    NgClass,
    DatePipe,
    MatPaginatorModule,
    MatDividerModule,
    MatDialogModule,
    CurrencyPipe,
    MatSortModule,
  ],
  templateUrl: './table-projects.html',
  styleUrl: './table-projects.scss',
})
export class TableProjects implements AfterViewInit {
  // =========================================================
  // Dependências
  // =========================================================

  readonly projetosService = inject(ProjetoService);
  readonly dialog = inject(MatDialog);

  // =========================================================
  // Tabela
  // =========================================================

  readonly dataSource = new MatTableDataSource<Projeto>(this.projetosService.projetos());

  @ViewChild(MatPaginator) readonly paginator!: MatPaginator;
  @ViewChild(MatSort) readonly sort!: MatSort;

  // =========================================================
  // Filtros
  // =========================================================

  readonly filtroCategoria = input.required<string>();
  readonly filtroStatus = input<StatusFiltro>('PRIORIDADE');
  readonly filtroUsuario = input<number | null>(null);
  readonly filtroGestor = input<number | null>(null);

  protected readonly statusProjeto = StatusProject;

  // =========================================================
  // Inicialização
  // =========================================================

  constructor() {
    effect(() => {
      this.aplicarFiltros();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // =========================================================
  // Aplicação dos filtros
  // =========================================================

  private aplicarFiltros(): void {
    const categoria = this.filtroCategoria();
    const status = this.filtroStatus();
    const usuario = this.filtroUsuario();
    const gestor = this.filtroGestor();

    this.dataSource.data = this.projetosService.projetos().filter((projeto) => {
      const categoriaOk = !categoria || projeto.categoria === categoria;

      const statusOk = !status
        ? true
        : status === 'PRIORIDADE'
          ? projeto.prioridade
          : status === StatusProject.ATRASADO
            ? projeto.atrasado
            : projeto.status === status;

      const usuarioOk = usuario === null || projeto.criadoPor?.id === usuario;

      const gestorOk = gestor === null || projeto.criadoPor?.gestor_id === gestor;

      return categoriaOk && statusOk && usuarioOk && gestorOk;
    });
  }

  // =========================================================
  // Tarefas em atraso
  // =========================================================

  tarefasAtrasadas(projeto: Projeto): number {
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    return projeto.tarefas.filter((tarefa) => {
      if (tarefa.status === StatusTasks.CONCLUIDA || !tarefa.dataTermino) {
        return false;
      }

      const dataTermino = new Date(tarefa.dataTermino);

      dataTermino.setHours(0, 0, 0, 0);

      return dataTermino < hoje;
    }).length;
  }

  // =========================================================
  // Dialogs
  // =========================================================

  openDialogEdit(projeto: Projeto): void {
    const dialogRef = this.dialog.open(DialogOverviewProject, {
      width: '80vw',
      maxWidth: '1500px',
      data: projeto,
    });

    dialogRef.afterClosed().subscribe((projetoRetornado: Projeto | undefined) => {
      if (!projetoRetornado) {
        return;
      }

      this.projetosService.atualizarProjeto(projetoRetornado);
    });
  }

  openDialogDelete(projeto: Projeto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Excluir projeto?',
        mensagem: 'Tem certeza que deseja excluir este projeto? Essa ação não pode ser desfeita.',
        textoCancelar: 'Cancelar',
        textoConfirmar: 'Excluir',
        acao: 'exclusao',
      },
    });

    dialogRef.afterClosed().subscribe((resposta: boolean) => {
      if (resposta) {
        this.projetosService.deletarProjeto(projeto);
      }
    });
  }

  // =========================================================
  // Colunas
  // =========================================================

  readonly displayedColumns: string[] = [
    'nome',
    'criadoPor',
    'status',
    'dataInicio',
    'tarefasConcluidas',
    'dataTermino',
    'orcamento',
    'ganhoPar',
    'acoes',
  ];

  formatarNomeCurto(nome: string | undefined | null): string {
  if (!nome) {
    return '';
  }

  return nome.trim().split(/\s+/).slice(0, 2).join(' ');
}
}
