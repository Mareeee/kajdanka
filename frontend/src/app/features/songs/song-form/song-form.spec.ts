import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongForm } from './song-form';

describe('SongForm', () => {
  let component: SongForm;
  let fixture: ComponentFixture<SongForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
