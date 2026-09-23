import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card-status-project',
  imports: [MatCardModule, MatIconModule, CurrencyPipe, DecimalPipe],
  templateUrl: './card-status-projects.html',
  styleUrl: './card-status-projects.scss',
})
export class CardStatusProjects implements AfterViewInit, OnDestroy {
  // --------------------------------------------------
  // Inputs
  // --------------------------------------------------

  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();

  readonly mostrarProgresso = input(false);
  readonly itensConcluidos = input(0);
  readonly totalItens = input(0);

  readonly tipoValor = input<'numero' | 'moeda'>('numero');

  // --------------------------------------------------
  // Elementos do template
  // --------------------------------------------------

  readonly cardInfo = viewChild<ElementRef<HTMLElement>>('cardInfo');
  readonly cardValue = viewChild<ElementRef<HTMLElement>>('cardValue');

  // --------------------------------------------------
  // Controle de redimensionamento
  // --------------------------------------------------

  private resizeObserver?: ResizeObserver;

  // --------------------------------------------------
  // Valores calculados
  // --------------------------------------------------

  readonly percentual = computed(() => {
    const total = this.totalItens();

    if (total <= 0) {
      return 0;
    }

    return Math.min((this.itensConcluidos() / total) * 100, 100);
  });

  // --------------------------------------------------
  // Construtor
  // --------------------------------------------------

  constructor() {
    /*
     * Executa novamente sempre que o valor ou o tipo
     * de valor forem alterados.
     */
    effect(() => {
      this.value();
      this.tipoValor();

      /*
       * Aguarda o Angular atualizar o DOM antes de
       * medir a largura do texto.
       */
      setTimeout(() => {
        this.ajustarTamanhoValor();
      });
    });
  }

  // --------------------------------------------------
  // Ajuste automático da fonte
  // --------------------------------------------------

  private ajustarTamanhoValor(): void {
    const elemento = this.cardValue()?.nativeElement;
    const container = this.cardInfo()?.nativeElement;

    if (!elemento || !container) {
      return;
    }

    const tamanhoMaximo = 30;
    const tamanhoMinimo = 14;

    /*
     * Sempre começa pelo tamanho máximo.
     * Dessa forma, se o valor diminuir novamente,
     * a fonte também volta a aumentar.
     */
    elemento.style.fontSize = `${tamanhoMaximo}px`;

    const larguraDisponivel = container.clientWidth;

    if (larguraDisponivel <= 0) {
      return;
    }

    let tamanhoAtual = tamanhoMaximo;

    /*
     * Diminui a fonte até o conteúdo caber
     * dentro da largura disponível.
     */
    while (elemento.scrollWidth > larguraDisponivel && tamanhoAtual > tamanhoMinimo) {
      tamanhoAtual--;

      elemento.style.fontSize = `${tamanhoAtual}px`;
    }
  }

  // --------------------------------------------------
  // Inicialização
  // --------------------------------------------------

  ngAfterViewInit(): void {
    /*
     * Primeiro ajuste depois que o componente
     * estiver renderizado.
     */
    setTimeout(() => {
      this.ajustarTamanhoValor();

      const container = this.cardInfo()?.nativeElement;

      if (!container) {
        return;
      }

      /*
       * Observa mudanças no tamanho disponível.
       *
       * Isso cobre:
       * - redimensionamento da janela;
       * - zoom do navegador;
       * - mudanças no layout;
       * - alterações no tamanho do card.
       */
      this.resizeObserver = new ResizeObserver(() => {
        this.ajustarTamanhoValor();
      });

      this.resizeObserver.observe(container);
    });
  }

  // --------------------------------------------------
  // Limpeza
  // --------------------------------------------------

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
