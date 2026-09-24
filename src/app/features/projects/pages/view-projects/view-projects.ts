import { Component, computed, inject, signal, Signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconRegistry } from '@angular/material/icon';
import { CardStatusProjects } from '../../components/card-status/card-status-projects';
import { ProjectsCard } from '../../components/projects-card/projects-card';
import { StatusProject } from '../../../../shared/enums/status.enum';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { Projeto } from '../../../../shared/models/projeto/projeto.interface';
import { ProjectCategories } from '../../../../shared/enums/projects-category.enum';

type CardValues = {
  icon: string;
  title: string;
  value: Signal<string | number>;
  tipoValor?: 'numero' | 'moeda';
  mostrarProgresso?: boolean;
  itensConcluidos?: Signal<number>;
  totalItens?: Signal<number>;
};

@Component({
  selector: 'app-view-projects',
  imports: [MatButtonModule, ProjectsCard, CardStatusProjects],
  templateUrl: './view-projects.html',
  styleUrl: './view-projects.scss',
})
export class ViewProjects {
  // ---------------------------------------------------------------------------
  // Dependências
  // ---------------------------------------------------------------------------

  private readonly projetosService = inject(ProjetoService);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  // ---------------------------------------------------------------------------
  // Dados principais
  // ---------------------------------------------------------------------------

  readonly projetos = this.projetosService.projetos;

  // ---------------------------------------------------------------------------
  // Filtros
  // ---------------------------------------------------------------------------

  protected readonly usuarioSelecionado = signal<number | null>(null);
  protected readonly gestorSelecionado = signal<number | null>(null);

  protected readonly statusSelecionado = signal<StatusProject | ''>(StatusProject.EM_ANDAMENTO);
  protected readonly categoriaSelecionada = signal<ProjectCategories | ''>('');

  // ---------------------------------------------------------------------------
  // Projetos filtrados
  // ---------------------------------------------------------------------------

  private readonly projetosFiltrados = computed(() => {
    const usuarioId = this.usuarioSelecionado();
    const gestorId = this.gestorSelecionado();
    const status = this.statusSelecionado();
    const categoria = this.categoriaSelecionada();

    return this.projetos().filter((projeto) => {
      const atendeUsuario = usuarioId === null || projeto.criadoPor?.id === usuarioId;

      const atendeGestor = gestorId === null || projeto.criadoPor?.gestor_id === gestorId;

      const atendeStatus = this.projetoAtendeStatus(projeto, status);

      const atendeCategoria = categoria === StatusProject.TODOS || projeto.categoria === categoria;

      return atendeUsuario && atendeGestor && atendeStatus && atendeCategoria;
    });
  });

  // ---------------------------------------------------------------------------
  // Indicadores dos cards
  // ---------------------------------------------------------------------------

  public readonly totalProjetos = computed(() => this.projetosFiltrados().length);

  private readonly projetosEmAndamento = computed(
    () =>
      this.projetosFiltrados().filter((projeto) => projeto.status === StatusProject.EM_ANDAMENTO)
        .length,
  );

  private readonly projetosConcluidos = computed(
    () =>
      this.projetosFiltrados().filter((projeto) => projeto.status === StatusProject.CONCLUIDA)
        .length,
  );

  private readonly projetosNaoIniciados = computed(
    () =>
      this.projetosFiltrados().filter((projeto) => projeto.status === StatusProject.NAO_INICIADO)
        .length,
  );

  private readonly projetosAtrasados = computed(
    () => this.projetosFiltrados().filter((projeto) => projeto.atrasado).length,
  );

  private readonly ganhosFiltrados = computed(() => {
    return this.projetosFiltrados().reduce((total, projeto) => {
      if (projeto.orcamento === null || projeto.orcamento === undefined) {
        return total;
      }

      const valorTexto = String(projeto.orcamento).replace('R$', '').trim();

      if (!valorTexto) {
        return total;
      }

      let valor: number;

      const temVirgula = valorTexto.includes(',');
      const temPonto = valorTexto.includes('.');

      if (temVirgula && temPonto) {
        /*
         * Formato brasileiro:
         * 82.000,00
         */
        valor = Number(valorTexto.replace(/\./g, '').replace(',', '.'));
      } else if (temVirgula) {
        /*
         * Formato brasileiro sem separador de milhar:
         * 82000,00
         */
        valor = Number(valorTexto.replace(',', '.'));
      } else {
        /*
         * Formato numérico/decimal:
         * 82000
         * 82000.00
         * 82000.50
         */
        valor = Number(valorTexto);
      }

      return total + (Number.isFinite(valor) ? valor : 0);
    }, 0);
  });

  // ---------------------------------------------------------------------------
  // Configuração dos cards
  // ---------------------------------------------------------------------------

  readonly cardValues: CardValues[] = [
    {
      icon: 'totalProjetos',
      title: 'Total de Projetos',
      value: this.totalProjetos,
    },
    {
      icon: 'emAndamento',
      title: 'Em Andamento',
      value: this.projetosEmAndamento,
      mostrarProgresso: true,
      itensConcluidos: this.projetosEmAndamento,
      totalItens: this.totalProjetos,
    },
    {
      icon: 'concluidos',
      title: 'Concluídos',
      value: this.projetosConcluidos,
      mostrarProgresso: true,
      itensConcluidos: this.projetosConcluidos,
      totalItens: this.totalProjetos,
    },
    {
      icon: 'naoIniciados',
      title: 'Não Iniciados',
      value: this.projetosNaoIniciados,
      mostrarProgresso: true,
      itensConcluidos: this.projetosNaoIniciados,
      totalItens: this.totalProjetos,
    },
    {
      icon: 'atrasado',
      title: 'Atrasados',
      value: this.projetosAtrasados,
      mostrarProgresso: true,
      itensConcluidos: this.projetosAtrasados,
      totalItens: this.totalProjetos,
    },
    {
      icon: 'ganhos',
      title: 'Ganhos',
      value: this.ganhosFiltrados,
      tipoValor: 'moeda',
      mostrarProgresso: false,
    },
  ];

  // ---------------------------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------------------------

  constructor() {
    this.registrarIcones();
  }

  // ---------------------------------------------------------------------------
  // Regras de filtro
  // ---------------------------------------------------------------------------

  private projetoAtendeStatus(projeto: Projeto, status: StatusProject | ''): boolean {
    if (!status) {
      return true;
    }

    if (status === StatusProject.ATRASADO) {
      return projeto.atrasado;
    }

    return projeto.status === status;
  }

  // ---------------------------------------------------------------------------
  // Conversões
  // ---------------------------------------------------------------------------

  private converterOrcamento(orcamento: string | null): number {
    if (!orcamento) {
      return 0;
    }

    const valor = Number(orcamento.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

    return Number.isNaN(valor) ? 0 : valor;
  }

  // ---------------------------------------------------------------------------
  // Ícones
  // ---------------------------------------------------------------------------

  private registrarIcones(): void {
    const icones = [
      'naoIniciados',
      'concluidos',
      'emAndamento',
      'totalProjetos',
      'atrasado',
      'ganhos',
    ];

    for (const nomeIcone of icones) {
      this.iconRegistry.addSvgIcon(
        nomeIcone,
        this.sanitizer.bypassSecurityTrustResourceUrl(`dashboard/card-status/${nomeIcone}.svg`),
      );
    }
  }
}
