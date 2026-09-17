import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-card-status-tasks',
  imports: [
    MatCardModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './card-status.html',
  styleUrl: './card-status.scss',
})
export class CardStatusTasks {
  numerador = input.required<number>();
  denominador = input.required<number>();

  status = input<string>()

  icon = input.required<string>();
  title = input.required<string>();
  value = input.required<string | number>();
}
