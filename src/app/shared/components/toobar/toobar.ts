import {
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogNewProject } from '../../../features/projects/components/dialog-new-project/dialog-new-project';

@Component({
  selector: 'app-toobar',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './toobar.html',
  styleUrl: './toobar.scss',
})
export class Toobar {
  title = input.required<string>();
  description = input.required<string>();

  /**
   * Controla a exibição do botão de menu.
   */
  mostrarMenu = input(false);

  /**
   * Evento emitido quando o usuário clica
   * no botão de menu.
   */
  menuClick = output<void>();

  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  get isProjetosUrl(): boolean {
    return this.router.url === '/projetos';
  }

  abrirMenu(): void {
    this.menuClick.emit();
  }

  openDialog(): void {
    this.dialog.open(DialogNewProject, {
      width: '80vw',
      maxWidth: '1500px',
    });
  }
}