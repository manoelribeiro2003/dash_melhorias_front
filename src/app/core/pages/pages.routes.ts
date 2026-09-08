import { Routes } from '@angular/router';
import { Pages } from './pages';
import { Dashboard } from '../../features/dashboard/pages/dashboard/dashboard';
import { ViewProjects } from '../../features/projects/pages/view-projects/view-projects';
import { ViewTasks } from '../../features/tasks/pages/view-tasks/view-tasks';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
    {
        path: '',
        component: Pages,
        children:[
            {
                path: '',
                component: Dashboard,
                data:{
                    title: 'Dashborad',
                    description: 'Visão geral dos projetos'
                }
            },
            {
                path: 'projetos',
                component: ViewProjects,
                data:{
                    title: 'Projetos',
                    description: 'Liste e acompanhe todos os projetos'
                }
            },
            {
                path: 'entregaveis',
                component: ViewTasks,
                data:{
                    title: 'Entregáveis da Semana',
                    description: 'Acompanhe todas os entregáveis da semana'
                }
            },
        ]
    },
    { 
        path: '**', 
        component: NotFound
    }
]