import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChordDisplay } from './chord-display';

describe('ChordDisplay', () => {
  let component: ChordDisplay;
  let fixture: ComponentFixture<ChordDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChordDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChordDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
