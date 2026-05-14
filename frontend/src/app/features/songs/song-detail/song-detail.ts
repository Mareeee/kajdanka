import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../../core/services/song.service';
import { SongDetail } from '../../../core/models/song.model';
import { ChordDisplayComponent } from '../../../shared/components/chord-display/chord-display';
import { transposeLyrics } from '../../../core/utils/transpose.util';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  templateUrl: './song-detail.html',
  styleUrls: ['./song-detail.scss'],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatSliderModule, MatProgressSpinnerModule, MatDividerModule,
    ChordDisplayComponent
  ]
})
export class SongDetailComponent implements OnInit {
  song: SongDetail | null = null;
  loading = true;
  semitones = 0;

  constructor(
    private route: ActivatedRoute,
    private songService: SongService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.songService.getSong(id).subscribe({
      next: song => {
        this.song = song;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get transposedLyrics(): string {
    if (!this.song?.lyrics) return '';
    return transposeLyrics(this.song.lyrics, this.semitones);
  }

  get transposeLabel(): string {
    if (this.semitones === 0) return 'Original';
    return `${this.semitones > 0 ? '+' : ''}${this.semitones} polutonova`;
  }

  get uniqueChords(): string[] {
    if (!this.transposedLyrics) return [];
    const matches = this.transposedLyrics.match(/\[([^\]]+)\]/g) ?? [];
    const unique = [...new Set(matches.map(m => m.replace(/[\[\]]/g, '')))];
    return unique;
  }

  changeSemitones(delta: number): void {
    this.semitones = Math.max(-6, Math.min(6, this.semitones + delta));
  }

  resetTranspose(): void {
    this.semitones = 0;
  }
}