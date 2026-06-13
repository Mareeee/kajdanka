import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongAnalyze } from './song-analyze';

describe('SongAnalyze', () => {
  let component: SongAnalyze;
  let fixture: ComponentFixture<SongAnalyze>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongAnalyze]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongAnalyze);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
