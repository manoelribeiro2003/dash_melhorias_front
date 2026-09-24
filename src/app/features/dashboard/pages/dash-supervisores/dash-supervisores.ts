import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CardSupervisor } from '../../components/dash-cards/card-supervisor/card-supervisor';
import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';

interface IndicadorStatus {
  quantidade: number;
  valor: number;
}

interface ResumoSupervisor {
  id: number;
  nome: string;
  totalProjetos: number;
  impactoFinanceiro: number;
  backlog: IndicadorStatus;
  andamento: IndicadorStatus;
  atrasados: IndicadorStatus;
  concluidos: IndicadorStatus;
}

@Component({
  selector: 'app-dash-supervisores',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, CardSupervisor],
  templateUrl: './dash-supervisores.html',
  styleUrl: './dash-supervisores.scss',
})
export class DashSupervisores {
  private readonly projetoService = inject(ProjetoService);
  private readonly usuarioService = inject(UsuarioService);

  readonly projetos = this.projetoService.projetos;
  readonly usuarios = this.usuarioService.usuarios;
  readonly gestores = this.usuarioService.gestores;

  readonly supervisores = computed<ResumoSupervisor[]>(() => {
    const mapa = new Map<number, ResumoSupervisor>();

    this.gestores().forEach((gestor) => {
      mapa.set(gestor.id, {
        id: gestor.id,
        nome: gestor.nome,
        totalProjetos: 0,
        impactoFinanceiro: 0,
        backlog: { quantidade: 0, valor: 0 },
        andamento: { quantidade: 0, valor: 0 },
        atrasados: { quantidade: 0, valor: 0 },
        concluidos: { quantidade: 0, valor: 0 },
      });
    });

    this.projetos().forEach((projeto) => {
      const gestorId = projeto.criadoPor?.gestor_id;
      if (!gestorId) return;

      const supervisor = mapa.get(gestorId);
      if (!supervisor) return;

      const valor = Number(projeto.ganhoPar ?? 0);

      supervisor.totalProjetos++;
      supervisor.impactoFinanceiro += valor;

      if (projeto.atrasado) {
        supervisor.atrasados.quantidade++;
        supervisor.atrasados.valor += valor;
        return;
      }

      switch (projeto.status) {
        case 'Backlog':
          supervisor.backlog.quantidade++;
          supervisor.backlog.valor += valor;
          break;

        case 'Em Andamento':
          supervisor.andamento.quantidade++;
          supervisor.andamento.valor += valor;
          break;

        case 'Concluído':
          supervisor.concluidos.quantidade++;
          supervisor.concluidos.valor += valor;
          break;
      }
    });

    return [...mapa.values()];
  });

  readonly totalProjetos = computed(() =>
    this.supervisores().reduce((total, s) => total + s.totalProjetos, 0),
  );

  readonly impactoFinanceiroTotal = computed(() =>
    this.supervisores().reduce((total, s) => total + s.impactoFinanceiro, 0),
  );
}
