import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Toobar } from '../../shared/components/toobar/toobar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';

@Component({
  selector: 'app-pages',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLinkWithHref,
    RouterLinkActive,
    Toobar
  ],
  templateUrl: './pages.html',
  styleUrl: './pages.scss',
})
export class Pages {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute)

  title = 'Dashboard';
  description = '';

  constructor(){
    this.router.events.
    pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(
      () => {
        let route = this.activatedRoute;

        while(route.firstChild){
          route = route.firstChild
        }

        this.title = route.snapshot.data['title'] ?? 'Dashboard'
        this.description = route.snapshot.data['description'] ?? ''
      }
    )
  }

  menuItems = [
    { active: true, exact: true, route: '/', label: 'Dashboard', icon: 'home' },
    { active: true, exact: false, route: '/projetos', label: 'Projetos', icon: 'business_center' },
    { active: true, exact: true, route: '/entregaveis', label: 'Entregáveis', icon: 'assignment' },
    { active: false, exact: true, route: '/cronograma', label: 'Cronograma', icon: 'calendar_month' },
    { active: false, exact: true, route: '/kanban', label: 'Kanban', icon: 'view_kanban' },
    { active: false, exact: true, route: '/recursos', label: 'Recursos', icon: 'inventory_2' },
    { active: false, exact: true, route: '/equipe', label: 'Equipe', icon: 'groups' },
    { active: false, exact: true, route: '/clientes', label: 'Clientes', icon: 'people' },
    { active: false, exact: true, route: '/relatorios', label: 'Relatórios', icon: 'analytics' },
    { active: false, exact: true, route: '/documentos', label: 'Documentos', icon: 'description' },
    { active: false, exact: true, route: '/riscos', label: 'Riscos', icon: 'warning' },
    { active: false, exact: true, route: '/financeiro', label: 'Financeiro', icon: 'account_balance_wallet' },
    { active: false, exact: true, route: '/configuracoes', label: 'Configurações', icon: 'settings' }
  ];

  shortcuts = [
    { label: 'Novo Projeto', icon: 'add', route: '/projetos/novo' },
    { label: 'Minhas Tarefas', icon: 'task_alt', route: '/tarefas/minhas' },
    { label: 'Calendário', icon: 'calendar_month', route: '/calendario' }
  ];

}
