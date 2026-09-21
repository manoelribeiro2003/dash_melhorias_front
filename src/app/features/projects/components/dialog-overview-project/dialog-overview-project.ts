import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { ProjetoService } from '../../../../shared/services/projeto/projeto.service';
import { UsuarioService } from '../../../../shared/services/usuario/usuario.service';
import { Historico } from '../../../../shared/services/historico/historico.service';
import { DragDropComponent } from '../drag-drop/drag-drop';
import { Projeto } from '../../../../shared/models/projeto/projeto.interface';
import { StatusProject } from '../../../../shared/enums/status.enum';
import { ProjectCategories } from '../../../../shared/enums/projects-category.enum';
import { HistoricoProjeto } from '../../../../shared/models/historico/historico-projeto.interface';
import { Usuario } from '../../../../shared/models/usuario/usuario.interface';
import { Tarefa } from '../../../../shared/models/tarefa/tarefa.interface';

@Component({
  selector: 'app-dialog-project',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatTooltipModule,
    DragDropModule,
    FormsModule,
    DragDropComponent,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './dialog-overview-project.html',
  styleUrl: './dialog-overview-project.scss',
})
export class DialogOverviewProject {
  // ==========================================================
  // DEPENDÊNCIAS
  // ==========================================================

  private readonly dialogRef =
    inject(MatDialogRef<DialogOverviewProject>);

  private readonly data =
    inject<Projeto>(MAT_DIALOG_DATA);

  private readonly projetosService =
    inject(ProjetoService);

  private readonly usuariosService =
    inject(UsuarioService);

  private readonly historicoService =
    inject(Historico);

  // ==========================================================
  // DADOS
  // ==========================================================

  readonly projetoRecebido: Projeto = {
    ...this.data,
  };

  readonly usuarios = this.usuariosService.usuarios;

  readonly gestores = this.usuariosService.gestores;

  protected readonly statusProjeto = StatusProject;

  readonly categorias = Object.values(ProjectCategories).sort();

  // ==========================================================
  // PESQUISA DE USUÁRIOS
  // ==========================================================

  protected readonly pesquisaUsuario = signal('');

  protected readonly usuariosFiltrados = computed(() => {
    const termo = this.pesquisaUsuario()
      .toLowerCase()
      .trim();

    return this.usuarios().filter((usuario) =>
      usuario.nome.toLowerCase().includes(termo),
    );
  });

  // ==========================================================
  // HISTÓRICO DO PROJETO
  // ==========================================================

  /**
   * Histórico válido do projeto, ordenado do mais antigo
   * para o mais recente.
   */
  private readonly historicoProjeto = computed(() => {
    const historico = this.historicoService
      .historicoProjetos()
      .get(this.projetoRecebido.id);

    return (
      historico
        ?.filter((item) => !item.excluido)
        .slice()
        .sort((a, b) => a.id - b.id) ?? []
    );
  });

  /**
   * Histórico das alterações da data de início.
   *
   * A primeira versão é adicionada somente quando
   * identificamos a primeira alteração.
   */
  readonly alteracoesDataInicioProjeto = computed(() =>
    this.obterAlteracoesData(
      this.historicoProjeto(),
      'dataInicio',
    ),
  );

  /**
   * Histórico das alterações da data de término.
   */
  readonly alteracoesDataTerminoProjeto = computed(() =>
    this.obterAlteracoesData(
      this.historicoProjeto(),
      'dataTermino',
    ),
  );

  /**
   * Retorna somente os snapshots nos quais o campo
   * informado sofreu alteração.
   *
   * A primeira versão também é incluída para servir
   * como origem do histórico.
   */
  private obterAlteracoesData(
    historico: HistoricoProjeto[],
    campo: 'dataInicio' | 'dataTermino',
  ): HistoricoProjeto[] {
    if (historico.length < 2) {
      return [];
    }

    const alteracoes: HistoricoProjeto[] = [];

    for (let i = 1; i < historico.length; i++) {
      const anterior = historico[i - 1];
      const atual = historico[i];

      const valorAnterior = this.normalizarData(
        anterior[campo],
      );

      const valorAtual = this.normalizarData(
        atual[campo],
      );

      if (valorAnterior !== valorAtual) {
        if (!alteracoes.length) {
          alteracoes.push(historico[0]);
        }

        alteracoes.push(atual);
      }
    }

    return alteracoes;
  }

  /**
   * Retorna o snapshot imediatamente anterior ao atual.
   */
  obterDataAnterior(
    alteracoes: HistoricoProjeto[],
    campo: 'dataInicio' | 'dataTermino',
  ): string {
    if (alteracoes.length < 2) {
      return '';
    }

    return this.formatarData(
      alteracoes[alteracoes.length - 2][campo],
    );
  }

  /**
   * Monta o texto do tooltip contendo todo o histórico
   * da data selecionada.
   */
  formatarAlteracoesDataProjeto(
    alteracoes: HistoricoProjeto[],
    campo: 'dataInicio' | 'dataTermino',
  ): string {
    if (!alteracoes.length) {
      return '';
    }

    return [
      'Alterações:',
      ...alteracoes.map(
        (alteracao, index) =>
          `${index + 1}º ${this.formatarData(
            alteracao[campo],
          )}`,
      ),
    ].join('\n');
  }

  // ==========================================================
  // DATAS
  // ==========================================================

  private normalizarData(
    data: Date | string | null | undefined,
  ): string | null {
    if (!data) {
      return null;
    }

    if (typeof data === 'string') {
      return data.split('T')[0];
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  formatarData(
    data: Date | string | null | undefined,
  ): string {
    const valor = this.normalizarData(data);

    if (!valor) {
      return '-';
    }

    const [ano, mes, dia] = valor.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  // ==========================================================
  // PESQUISA DE USUÁRIO
  // ==========================================================

  alterarPesquisaUsuario(valor: string): void {
    this.pesquisaUsuario.set(valor);
  }

  // ==========================================================
  // TAREFAS
  // ==========================================================

  atualizarTarefas(tarefas: Tarefa[]): void {
    this.projetoRecebido.tarefas = tarefas;
  }

  // ==========================================================
  // USUÁRIOS
  // ==========================================================

  compararUsuarios(
    usuario1: Usuario | null,
    usuario2: Usuario | null,
  ): boolean {
    return usuario1?.id === usuario2?.id;
  }

  // ==========================================================
  // ORÇAMENTO
  // ==========================================================

  orcamentoFormatado = '';

  formatarOrcamento(event: Event): void {
    const input = event.target as HTMLInputElement;

    const valor = input.value
      .replace(/\D/g, '');

    if (!valor) {
      this.orcamentoFormatado = '';
      this.projetoRecebido.orcamento = null;
      return;
    }

    const numero = Number(valor) / 100;

    this.orcamentoFormatado = numero.toLocaleString(
      'pt-BR',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    );

    this.projetoRecebido.orcamento =
      numero.toFixed(2);
  }

  // ==========================================================
  // GANHO/PAR
  // ==========================================================

  ganhoParFormatado = '';

  formatarGanhoPar(event: Event): void {
    const input = event.target as HTMLInputElement;

    const valor = input.value
      .replace(/\D/g, '');

    if (!valor) {
      this.ganhoParFormatado = '';
      this.projetoRecebido.ganhoPar = null;
      return;
    }

    const numero = Number(valor) / 10000;

    this.ganhoParFormatado = numero.toLocaleString(
      'pt-BR',
      {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      },
    );

    this.projetoRecebido.ganhoPar =
      numero.toFixed(4);
  }

  // ==========================================================
  // CICLO DE VIDA
  // ==========================================================

  ngOnInit(): void {
    this.historicoService.carregarHistoricoProjeto(
      this.projetoRecebido.id,
    );

    if (this.projetoRecebido.orcamento) {
      const valor = Number(
        this.projetoRecebido.orcamento,
      );

      this.orcamentoFormatado = valor.toLocaleString(
        'pt-BR',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      );
    }

    if (this.projetoRecebido.ganhoPar) {
      const valor = Number(
        this.projetoRecebido.ganhoPar,
      );

      this.ganhoParFormatado = valor.toLocaleString(
        'pt-BR',
        {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        },
      );
    }
  }

  // ==========================================================
  // AÇÕES
  // ==========================================================

  salvarProjeto(): void {
    this.dialogRef.close(this.projetoRecebido);
  }

  fechar(): void {
    this.dialogRef.close();
  }
}