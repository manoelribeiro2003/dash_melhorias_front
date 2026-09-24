import { Routes } from '@angular/router';

import { Pages } from './pages';
import { Dashboard } from '../../features/dashboard/pages/dashboard/dashboard';
import { DashLiderados } from '../../features/dashboard/pages/dash-liderados/dash-liderados';
import { DashProjetosLiderado } from '../../features/dashboard/pages/dash-projetos-liderado/dash-projetos-liderado';
import { ViewProjects } from '../../features/projects/pages/view-projects/view-projects';
import { ViewTasks } from '../../features/tasks/pages/view-tasks/view-tasks';
import { NotFound } from './not-found/not-found';
import { DashSupervisores } from '../../features/dashboard/pages/dash-supervisores/dash-supervisores';

export const routes: Routes = [
  {
    path: '',
    component: Pages,
    children: [
      {
        path: '',
        component: Dashboard,
        title: 'Gestão de Performance',
        data: {
          title: 'Dashboard',
          description: 'Visão geral dos projetos',
        },
        children: [
          {
            path: '',
            redirectTo: 'supervisores',
            pathMatch: 'full',
          },
          {
            path: 'supervisores',
            component: DashSupervisores,
          },
          {
            path: 'liderados',
            component: DashLiderados,
          },
          {
            path: 'projetos-liderado',
            component: DashProjetosLiderado,
          },
        ],
      },

      {
        path: 'projetos',
        component: ViewProjects,
        title: 'Projetos',
        data: {
          title: 'Projetos',
          description: 'Liste e acompanhe todos os projetos',
        },
      },

      {
        path: 'entregaveis',
        component: ViewTasks,
        title: 'Entregáveis',
        data: {
          title: 'Entregáveis da Semana',
          description: 'Acompanhe todos os entregáveis da semana',
        },
      },
    ],
  },

  {
    path: '**',
    component: NotFound,
  },
];
