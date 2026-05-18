import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistSongs } from './artist-songs';

describe('ArtistSongs', () => {
  let component: ArtistSongs;
  let fixture: ComponentFixture<ArtistSongs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistSongs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistSongs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
