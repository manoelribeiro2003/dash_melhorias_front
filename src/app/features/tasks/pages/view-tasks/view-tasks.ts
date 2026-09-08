import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-view-tasks',
  imports: [
    CardStatusTasks,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatDividerModule,
    MatDialogModule,
    MatSortModule,
    MatCardModule,
    DatePipe,
    CommonModule,
  ],
  templateUrl: './view-tasks.html',
  styleUrl: './view-tasks.scss',
})
export class ViewTasks {
  private projetosService = inject(ProjetoService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

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
  // ---Nova Atribuição do array de projetos---
  readonly projetos: Projeto[] = this.projetosService
    .projetos()
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
    .filter((projeto) => projeto.status !== 'Concluída' && projeto.status !== 'Não iniciado');

  // ====================== Data Source da Tabela ============================
  private projetos_p_nome = groupBy(this.projetos, (projeto) => projeto.criadoPor.nome);
  protected dataSource: PessoaProjetos[] = Array.from(this.projetos_p_nome.entries()).map(
    ([nome, projetos]) => ({ nome, projetos }),
  );

  // ====================== Dados dos valores dos Cards ============================
  protected tarefas = this.dataSource.flatMap((pessoaProjeto) =>
    pessoaProjeto.projetos.flatMap((projeto) =>
      projeto.tarefas.map((tarefa) => ({
        ...tarefa,
        projetoNome: projeto.nome,
      })),
    ),
  );

  protected indicadores = this.tarefas.reduce(
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
  );

  // ===============================================================================

  protected cardValues: CardValues[] = [
    { icon: 'totalProjetos', title: 'Tarefas da Semana', status: 'TotalItens' },
    { icon: 'emAndamento', title: 'Em Andamento', status: 'Em andamento' },
    { icon: 'concluidos', title: 'Concluídas', status: 'Concluída' },
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
