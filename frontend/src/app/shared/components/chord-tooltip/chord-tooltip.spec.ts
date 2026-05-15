import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChordTooltip } from './chord-tooltip';

describe('ChordTooltip', () => {
  let component: ChordTooltip;
  let fixture: ComponentFixture<ChordTooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChordTooltip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChordTooltip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
