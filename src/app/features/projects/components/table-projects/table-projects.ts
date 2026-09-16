import { AfterViewInit, Component, effect, inject, input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { DialogOverviewProject } from '../dialog-overview-project/dialog-overview-project';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ConfirmDialogComponent } from '../dialog-delete-project/confirm-dialog';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { Projeto } from '../../../../shared/models/projeto/projeto.interface';
import { StatusProject } from '../../../../shared/enums/status.enum';

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
  readonly projetosService = inject(ProjetoService);
  readonly dataSource = new MatTableDataSource<Projeto>(this.projetosService.projetos());
  @ViewChild(MatPaginator) readonly paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  readonly dialog = inject(MatDialog);
  readonly filtroCategoria = input.required<string>();
  readonly filtroStatus = input<string | null>('');
  readonly filtroUsuario = input<number | null>(null);
  readonly filtroGestor = input<number | null>(null);

  protected readonly statusProjeto = StatusProject;

  constructor() {
    effect(() => {
      this.aplicarFiltros();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private aplicarFiltros(): void {
    const projetos = this.projetosService.projetos();

    this.dataSource.data = projetos.filter((projeto) => {
      const categoriaOk = !this.filtroCategoria() || projeto.categoria === this.filtroCategoria();
      const statusOk = !this.filtroStatus()
        ? true
        : this.filtroStatus() === 'Atrasado'
          ? projeto.atrasado
          : projeto.status === this.filtroStatus();

      const usuarioOk =
        this.filtroUsuario() === null || projeto.criadoPor?.id === this.filtroUsuario();

      const gestorOk = this.filtroGestor() === null || projeto.gestor.id === this.filtroGestor();

      return categoriaOk && statusOk && usuarioOk && gestorOk;
    });
  }

  openDialogEdit(projeto: Projeto): void {
    const dialogRef = this.dialog.open(DialogOverviewProject, {
      width: '80vw',
      maxWidth: '1500px',
      data: projeto,
    });

    dialogRef.afterClosed().subscribe((projetoRetornado: Projeto | undefined) => {
      if (projetoRetornado === undefined) {
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

  displayedColumns: string[] = [
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
}
