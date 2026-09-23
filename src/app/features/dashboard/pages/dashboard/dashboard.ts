import { CurrencyPipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';
import { StatusProject } from '../../../../shared/enums/status.enum';



interface StatusFinanceiro {
  quantidade: number;
  valor: number;
}

interface SupervisorDashboard {
  id: number;
  nome: string;
  totalProjetos: number;

  backlog: StatusFinanceiro;
  andamento: StatusFinanceiro;
  atrasados: StatusFinanceiro;
  concluidos: StatusFinanceiro;

  impactoFinanceiro: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatIconModule,
    CurrencyPipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly projetoService = inject(ProjetoService);
  private readonly usuarioService = inject(UsuarioService);

  readonly projetos = this.projetoService.projetos;

  readonly supervisores = computed<SupervisorDashboard[]>(() => {
    const projetos = this.projetos();
    const gestores = this.usuarioService.gestores();

    const supervisoresMap = new Map<number, SupervisorDashboard>();

    /*
     * Primeiro identificamos todos os supervisores
     * que possuem projetos associados.
     */
    for (const projeto of projetos) {
      const supervisorId = projeto.criadoPor?.gestor_id;

      if (supervisorId == null) {
        continue;
      }

      if (!supervisoresMap.has(supervisorId)) {
        const supervisor = gestores.find(
          (gestor) => gestor.id === supervisorId,
        );

        supervisoresMap.set(supervisorId, {
          id: supervisorId,
          nome: supervisor?.nome ?? `Supervisor ${supervisorId}`,

          totalProjetos: 0,

          backlog: {
            quantidade: 0,
            valor: 0,
          },

          andamento: {
            quantidade: 0,
            valor: 0,
          },

          atrasados: {
            quantidade: 0,
            valor: 0,
          },

          concluidos: {
            quantidade: 0,
            valor: 0,
          },

          impactoFinanceiro: 0,
        });
      }
    }

    /*
     * Distribui cada projeto dentro do supervisor
     * correspondente.
     */
    for (const projeto of projetos) {
      const supervisorId = projeto.criadoPor?.gestor_id;

      if (supervisorId == null) {
        continue;
      }

      const supervisor = supervisoresMap.get(supervisorId);

      if (!supervisor) {
        continue;
      }

      const valor = this.converterValor(projeto.orcamento);

      supervisor.totalProjetos++;
      supervisor.impactoFinanceiro += valor;

      /*
       * Projeto atrasado tem prioridade sobre o status
       * "Em andamento".
       *
       * Assim, um projeto em andamento que passou
       * da data limite aparece somente em Atrasados.
       */
      if (projeto.atrasado) {
        supervisor.atrasados.quantidade++;
        supervisor.atrasados.valor += valor;

        continue;
      }

      switch (projeto.status) {
        case StatusProject.NAO_INICIADO:
          supervisor.backlog.quantidade++;
          supervisor.backlog.valor += valor;
          break;

        case StatusProject.EM_ANDAMENTO:
          supervisor.andamento.quantidade++;
          supervisor.andamento.valor += valor;
          break;

        case StatusProject.CONCLUIDA:
          supervisor.concluidos.quantidade++;
          supervisor.concluidos.valor += valor;
          break;
      }
    }

    return Array.from(supervisoresMap.values()).sort(
      (a, b) => b.totalProjetos - a.totalProjetos,
    );
  });

  /**
   * Quantidade total de projetos.
   */
  readonly totalProjetos = computed(() =>
    this.supervisores().reduce(
      (total, supervisor) =>
        total + supervisor.totalProjetos,
      0,
    ),
  );

  /**
   * Impacto financeiro total dos projetos.
   */
  readonly impactoFinanceiroTotal = computed(() =>
    this.supervisores().reduce(
      (total, supervisor) =>
        total + supervisor.impactoFinanceiro,
      0,
    ),
  );

  /**
   * Converte valores monetários vindos da API
   * em formatos diferentes.
   *
   * Exemplos:
   * 82000
   * 82000.00
   * "82000.00"
   * "82.000,00"
   * "R$ 82.000,00"
   */
  private converterValor(
    valor: string | number | null | undefined,
  ): number {
    if (valor === null || valor === undefined) {
      return 0;
    }

    if (typeof valor === 'number') {
      return Number.isFinite(valor) ? valor : 0;
    }

    const texto = String(valor)
      .replace('R$', '')
      .trim();

    if (!texto) {
      return 0;
    }

    const temVirgula = texto.includes(',');
    const temPonto = texto.includes('.');

    if (temVirgula && temPonto) {
      return Number(
        texto
          .replace(/\./g, '')
          .replace(',', '.'),
      );
    }

    if (temVirgula) {
      return Number(
        texto.replace(',', '.'),
      );
    }

    return Number(texto) || 0;
  }
}