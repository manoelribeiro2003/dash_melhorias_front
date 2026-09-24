import { Component, computed, inject, signal, Signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconRegistry } from '@angular/material/icon';

import { CardStatusProjects } from '../../components/card-status/card-status-projects';
import { ProjectsCard } from '../../components/projects-card/projects-card';

import { StatusProject } from '../../../../shared/enums/status.enum';
import { ProjectCategories } from '../../../../shared/enums/projects-category.enum';

import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';

import { Projeto } from '../../../../shared/models/projeto/projeto.interface';
import { Usuario } from '../../../../shared/models/usuario/usuario.interface';

import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';

type CardValues = {
  icon: string;
  title: string;
  value: Signal<string | number>;
  tipoValor?: 'numero' | 'moeda';
  mostrarProgresso?: boolean;
  itensConcluidos?: Signal<number>;
  totalItens?: Signal<number>;
};
type StatusFiltro = StatusProject | 'PRIORIDADE' | '';

@Component({
  selector: 'app-view-projects',
  imports: [MatButtonModule, ProjectsCard, CardStatusProjects],
  templateUrl: './view-projects.html',
  styleUrl: './view-projects.scss',
})
export class ViewProjects {
  // =========================================================
  // Dependências
  // =========================================================

  private readonly projetosService = inject(ProjetoService);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly usuarioService = inject(UsuarioService);

  // =========================================================
  // Dados
  // =========================================================

  readonly projetos = this.projetosService.projetos;

  // =========================================================
  // Filtros
  // =========================================================

  readonly usuarioSelecionado = signal<number | null>(null);
  readonly gestorSelecionado = signal<number | null>(null);
  readonly statusSelecionado = signal<StatusFiltro>('PRIORIDADE');
  readonly categoriaSelecionada = signal<ProjectCategories | ''>('');

  // =========================================================
  // Opções dinâmicas (estilo Excel)
  // Cada filtro ignora apenas a si próprio.
  // =========================================================

  readonly categoriasDisponiveis = computed<ProjectCategories[]>(() => {
    const gestor = this.gestorSelecionado();
    const usuario = this.usuarioSelecionado();

    // Sem gestor e sem responsável → mostra todas as categorias do sistema
    if (gestor === null && usuario === null) {
      return Object.values(ProjectCategories).sort();
    }

    // Com gestor e/ou responsável → mostra apenas as categorias dos projetos filtrados
    return [
      ...new Set(
        this.projetos()
          .filter(
            (projeto) =>
              (gestor === null || projeto.criadoPor?.gestor_id === gestor) &&
              (usuario === null || projeto.criadoPor?.id === usuario),
          )
          .map((projeto) => projeto.categoria)
          .filter(
            (categoria): categoria is ProjectCategories =>
              categoria !== null && categoria !== undefined && categoria !== '',
          ),
      ),
    ].sort();
  });

  readonly usuariosDisponiveis = computed(() => {
    const gestor = this.gestorSelecionado();
    const categoria = this.categoriaSelecionada();
    const status = this.statusSelecionado();

    return this.removerDuplicadosUsuarios(
      this.projetos()
        .filter(
          (projeto) =>
            (gestor === null || projeto.criadoPor?.gestor_id === gestor) &&
            (categoria === '' || projeto.categoria === categoria) &&
            this.projetoAtendeStatus(projeto, status),
        )
        .map((projeto) => projeto.criadoPor),
    );
  });

  readonly gestoresDisponiveis = computed(() => {
    const usuario = this.usuarioSelecionado();
    const categoria = this.categoriaSelecionada();
    const status = this.statusSelecionado();

    const gestoresIds = new Set(
      this.projetos()
        .filter(
          (projeto) =>
            (usuario === null || projeto.criadoPor?.id === usuario) &&
            (categoria === '' || projeto.categoria === categoria) &&
            this.projetoAtendeStatus(projeto, status),
        )
        .map((projeto) => projeto.criadoPor?.gestor_id)
        .filter((id): id is number => id !== null && id !== undefined),
    );

    return this.usuarioService
      .gestores()
      .filter((gestor) => gestoresIds.has(gestor.id))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  });

  readonly statusDisponiveis = computed<{ label: string; value: StatusFiltro }[]>(() => [
    { label: '⭐ Prioridade', value: 'PRIORIDADE' },
    { label: 'Em Andamento', value: StatusProject.EM_ANDAMENTO },
    { label: 'Não Iniciados', value: StatusProject.NAO_INICIADO },
    { label: 'Concluídos', value: StatusProject.CONCLUIDA },
    { label: 'Atrasados', value: StatusProject.ATRASADO },
  ]);

  // =========================================================
  // Projetos filtrados (fonte única da verdade)
  // =========================================================

  readonly projetosFiltrados = computed(() => {
    const usuario = this.usuarioSelecionado();
    const gestor = this.gestorSelecionado();
    const status = this.statusSelecionado();
    const categoria = this.categoriaSelecionada();

    return this.projetos().filter(
      (projeto) =>
        (usuario === null || projeto.criadoPor?.id === usuario) &&
        (gestor === null || projeto.criadoPor?.gestor_id === gestor) &&
        (categoria === '' || projeto.categoria === categoria) &&
        this.projetoAtendeStatus(projeto, status),
    );
  });

  // =========================================================
  // Indicadores dos cards
  // =========================================================

  readonly totalProjetos = computed(() => this.projetosFiltrados().length);

  readonly projetosEmAndamento = computed(
    () => this.projetosFiltrados().filter((p) => p.status === StatusProject.EM_ANDAMENTO).length,
  );

  readonly projetosConcluidos = computed(
    () => this.projetosFiltrados().filter((p) => p.status === StatusProject.CONCLUIDA).length,
  );

  readonly projetosNaoIniciados = computed(
    () => this.projetosFiltrados().filter((p) => p.status === StatusProject.NAO_INICIADO).length,
  );

  readonly projetosAtrasados = computed(
    () => this.projetosFiltrados().filter((p) => p.atrasado).length,
  );

  readonly ganhosFiltrados = computed(() =>
    this.projetosFiltrados().reduce((total, projeto) => {
      if (!projeto.orcamento) {
        return total;
      }

      const texto = String(projeto.orcamento).replace('R$', '').trim();

      const valor =
        texto.includes(',') && texto.includes('.')
          ? Number(texto.replace(/\./g, '').replace(',', '.'))
          : texto.includes(',')
            ? Number(texto.replace(',', '.'))
            : Number(texto);

      return total + (Number.isFinite(valor) ? valor : 0);
    }, 0),
  );

  // =========================================================
  // Configuração dos cards
  // =========================================================

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

  // =========================================================
  // Inicialização
  // =========================================================

  constructor() {
    this.registrarIcones();
  }

  // =========================================================
  // Regras
  // =========================================================

  private projetoAtendeStatus(projeto: Projeto, status: StatusFiltro): boolean {
    if (!status) {
      return true;
    }

    if (status === 'PRIORIDADE') {
      return projeto.prioridade;
    }

    if (status === StatusProject.ATRASADO) {
      return projeto.atrasado;
    }

    return projeto.status === status;
  }

  // =========================================================
  // Utilitários
  // =========================================================

  private removerDuplicadosUsuarios(usuarios: Usuario[]): Usuario[] {
    return usuarios
      .filter((usuario, index, array) => array.findIndex((u) => u.id === usuario.id) === index)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  private removerDuplicadosGestores(gestores: { id: number; nome: string }[]) {
    return gestores
      .filter((gestor, index, array) => array.findIndex((g) => g.id === gestor.id) === index)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  // =========================================================
  // Ícones
  // =========================================================

  private registrarIcones(): void {
    const icones = [
      'naoIniciados',
      'concluidos',
      'emAndamento',
      'totalProjetos',
      'atrasado',
      'ganhos',
    ];

    for (const icone of icones) {
      this.iconRegistry.addSvgIcon(
        icone,
        this.sanitizer.bypassSecurityTrustResourceUrl(`dashboard/card-status/${icone}.svg`),
      );
    }
  }
}
