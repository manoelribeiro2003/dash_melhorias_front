import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashLiderados } from './dash-liderados';

describe('DashLiderados', () => {
  let component: DashLiderados;
  let fixture: ComponentFixture<DashLiderados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashLiderados],
    }).compileComponents();

    fixture = TestBed.createComponent(DashLiderados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
