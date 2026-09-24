import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardProjetosLiderado } from './card-projetos-liderado';

describe('CardProjetosLiderado', () => {
  let component: CardProjetosLiderado;
  let fixture: ComponentFixture<CardProjetosLiderado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardProjetosLiderado],
    }).compileComponents();

    fixture = TestBed.createComponent(CardProjetosLiderado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
