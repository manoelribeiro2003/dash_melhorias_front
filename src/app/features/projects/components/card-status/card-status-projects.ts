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
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();

  readonly mostrarProgresso = input(false);
  readonly itensConcluidos = input(0);
  readonly totalItens = input(0);

  readonly tipoValor = input<'numero' | 'moeda'>('numero');

  readonly cardInfo = viewChild<ElementRef<HTMLElement>>('cardInfo');

  readonly cardValue = viewChild<ElementRef<HTMLElement>>('cardValue');

  private resizeObserver?: ResizeObserver;

  readonly percentual = computed(() => {
    const total = this.totalItens();

    if (total <= 0) {
      return 0;
    }

    return Math.min((this.itensConcluidos() / total) * 100, 100);
  });

  constructor() {
    effect(() => {
      this.value();
      this.tipoValor();

      setTimeout(() => {
        this.ajustarTamanhoValor();
      });
    });
  }

  private ajustarTamanhoValor(): void {
    const elemento = this.cardValue()?.nativeElement;
    const container = this.cardInfo()?.nativeElement;

    if (!elemento || !container) {
      return;
    }

    const tamanhoMaximo = 30;
    const tamanhoMinimo = 8;
    const margemSeguranca = 4;

    elemento.style.fontSize = `${tamanhoMaximo}px`;

    const larguraDisponivel = container.clientWidth - margemSeguranca;

    if (larguraDisponivel <= 0) {
      return;
    }

    let tamanhoAtual = tamanhoMaximo;

    while (elemento.scrollWidth > larguraDisponivel && tamanhoAtual > tamanhoMinimo) {
      tamanhoAtual--;

      elemento.style.fontSize = `${tamanhoAtual}px`;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ajustarTamanhoValor();

      const container = this.cardInfo()?.nativeElement;

      if (!container) {
        return;
      }

      this.resizeObserver = new ResizeObserver(() => {
        this.ajustarTamanhoValor();
      });

      this.resizeObserver.observe(container);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
