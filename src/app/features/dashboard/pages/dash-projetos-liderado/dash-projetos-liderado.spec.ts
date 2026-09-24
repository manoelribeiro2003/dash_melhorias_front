import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashProjetosLiderado } from './dash-projetos-liderado';

describe('DashProjetosLiderado', () => {
  let component: DashProjetosLiderado;
  let fixture: ComponentFixture<DashProjetosLiderado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashProjetosLiderado],
    }).compileComponents();

    fixture = TestBed.createComponent(DashProjetosLiderado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
