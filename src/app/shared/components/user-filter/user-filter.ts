import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

export interface ItemFiltroUsuario {
  id: number;
  nome: string;
}
@Component({
  selector: 'app-user-filter',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './user-filter.html',
  styleUrl: './user-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFilterComponent {
  readonly label = input('Usuário');
  readonly itens = input<readonly ItemFiltroUsuario[]>([]);
  readonly mostrarTodos = input(true);
  readonly disabled = input(false);

  readonly valor = model<number | null>(null);

  protected readonly pesquisa = signal('');

  protected readonly itensFiltrados = computed(() => {
    const termo = this.pesquisa().trim().toLowerCase();

    if (!termo) {
      return this.itens();
    }

    return this.itens().filter((item) =>
      item.nome.toLowerCase().includes(termo),
    );
  });

  protected alterarPesquisa(valor: string): void {
    this.pesquisa.set(valor);
  }

  protected limpar(event: MouseEvent): void {
    event.stopPropagation();
    this.valor.set(null);
  }

  protected limparPesquisa(): void {
    this.pesquisa.set('');
  }

  protected alterarValor(valor: number | null): void {
    console.log('Valor selecionado no componente filho:', valor);
    this.valor.set(valor);
  }
}
