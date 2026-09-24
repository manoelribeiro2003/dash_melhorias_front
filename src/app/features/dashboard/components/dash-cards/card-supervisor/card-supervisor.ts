import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ResumoSupervisor } from '../../../models/dashboard.models';

@Component({
  selector: 'app-card-supervisor',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './card-supervisor.html',
  styleUrl: './card-supervisor.scss',
})
export class CardSupervisor {
  readonly supervisor = input.required<ResumoSupervisor>();
}
