import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTabsModule, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly router = inject(Router);

  readonly selectedIndex = signal(0);

  constructor() {
    this.atualizarIndice(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.atualizarIndice(event.urlAfterRedirects));
  }

  trocarAba(index: number): void {
    const rotas = [
      '/supervisores', 
      '/liderados', 
      '/projetos-liderado'
    ];

    this.router.navigateByUrl(rotas[index]);
  }

  private atualizarIndice(url: string): void {
    if (url.includes('/liderados')) {
      this.selectedIndex.set(1);
      return;
    }

    if (url.includes('/projetos-liderado')) {
      this.selectedIndex.set(2);
      return;
    }

    this.selectedIndex.set(0);
  }
}
