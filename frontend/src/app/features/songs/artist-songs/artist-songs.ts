import { Component, inject, OnInit } from '@angular/core';
import { SongService } from './../../../core/services/song.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Song } from '../../../core/models/song.model';
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-artist-songs',
  imports: [MatProgressSpinner, RouterModule, MatIconModule],
  templateUrl: './artist-songs.html',
  styleUrl: './artist-songs.scss',
})
export class ArtistSongs implements OnInit {
  songs: Song[] | null = null;
  artist: string | null = '';
  loading = true;

  private songService = inject(SongService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.artist = this.route.snapshot.paramMap.get('artist');
    this.songService.getByArtist(this.artist!).subscribe({
      next: songs => {
        this.songs = songs ? [...songs].sort((a, b) => a.title.localeCompare(b.title)) : [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

  }
}
