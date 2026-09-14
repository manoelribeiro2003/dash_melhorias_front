import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ProjetoService } from './shared/services/projeto/projeto.service';
import { UsuarioService } from './shared/services/usuario/usuario.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    this.projetos.carregarProjetos();
    this.usuarios.carregarUsuarios();
    this.usuarios.carregarGestores();
  }
  private projetos = inject(ProjetoService);
  private usuarios = inject(UsuarioService);
}
