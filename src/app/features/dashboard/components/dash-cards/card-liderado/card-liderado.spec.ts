import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardLiderado } from './card-liderado';

describe('CardLiderado', () => {
  let component: CardLiderado;
  let fixture: ComponentFixture<CardLiderado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardLiderado],
    }).compileComponents();

    fixture = TestBed.createComponent(CardLiderado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
