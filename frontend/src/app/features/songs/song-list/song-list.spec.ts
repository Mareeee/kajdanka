import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongList } from './song-list';

describe('SongList', () => {
  let component: SongList;
  let fixture: ComponentFixture<SongList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
