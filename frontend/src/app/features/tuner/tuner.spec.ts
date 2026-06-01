import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tuner } from './tuner';

describe('Tuner', () => {
  let component: Tuner;
  let fixture: ComponentFixture<Tuner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tuner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tuner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
