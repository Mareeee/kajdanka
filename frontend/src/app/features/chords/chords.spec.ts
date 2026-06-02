import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chords } from './chords';

describe('Chords', () => {
  let component: Chords;
  let fixture: ComponentFixture<Chords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
