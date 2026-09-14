import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Usuario } from '../../models/usuario/usuario.interface';
import { Gestor } from '../../models/usuario/gestores.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  private _usuarios = signal<Usuario[]>([]);
  readonly usuarios = this._usuarios.asReadonly();
  private _gestores = signal<Gestor[]>([]);
  readonly gestores = this._gestores.asReadonly();

  carregarUsuarios(): void {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios/`).subscribe({
      next: (dados) => {
        this._usuarios.set(dados);
      },
      error: (erro) => {
        console.error(erro);
      },
    });
  }
  carregarGestores(): void {
    this.http.get<Gestor[]>(`${this.apiUrl}/usuarios/gestores`).subscribe({
      next: (dados) => {
        this._gestores.set(dados);
      },
      error: (erro) => {
        console.error(erro);
      },
    });
  }
}
