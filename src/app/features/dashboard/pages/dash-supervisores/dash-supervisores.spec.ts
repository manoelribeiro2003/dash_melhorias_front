import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashSupervisores } from './dash-supervisores';

describe('DashSupervisores', () => {
  let component: DashSupervisores;
  let fixture: ComponentFixture<DashSupervisores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashSupervisores],
    }).compileComponents();

    fixture = TestBed.createComponent(DashSupervisores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
