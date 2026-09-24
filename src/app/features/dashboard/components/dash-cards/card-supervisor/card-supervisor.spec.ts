import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSupervisor } from './card-supervisor';

describe('CardSupervisor', () => {
  let component: CardSupervisor;
  let fixture: ComponentFixture<CardSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSupervisor],
    }).compileComponents();

    fixture = TestBed.createComponent(CardSupervisor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
