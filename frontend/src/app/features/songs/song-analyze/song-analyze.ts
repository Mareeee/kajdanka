import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AnalyzeService } from '../../../core/services/analyze.service';
import { SongService } from '../../../core/services/song.service';
import { ChordDisplayComponent } from '../../../shared/components/chord-display/chord-display';
import { extractUniqueChords } from '../../../core/utils/transpose.util';
import { Song } from '../../../core/models/song.model';

@Component({
  selector: 'app-song-analyze',
  standalone: true,
  templateUrl: './song-analyze.html',
  styleUrls: ['./song-analyze.scss'],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatInputModule, MatFormFieldModule,
    ChordDisplayComponent,
  ]
})
export class SongAnalyzeComponent {

  private analyzeService = inject(AnalyzeService);
  private songService = inject(SongService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  youtubeLink = '';
  naslov = '';
  izvodjac = '';

  analyzing = false;
  saving = false;

  rezultat: string | null = null;
  savedSongId: number | null = null;

  get uniqueChords(): string[] {
    if (!this.rezultat) return [];
    return extractUniqueChords(this.rezultat);
  }

  analyze(): void {
    const link = this.youtubeLink.trim();
    if (!link) return;

    this.analyzing = true;
    this.rezultat = null;
    this.savedSongId = null;

    this.analyzeService.analyze(link, this.naslov.trim(), this.izvodjac.trim()).subscribe({
      next: (res) => {
        this.rezultat = res.result;
        this.naslov = res.title;
        this.izvodjac = res.performer;
        this.analyzing = false;
        this.saveSong();
      },
      error: () => {
        this.analyzing = false;
        this.snackBar.open('Greška pri analizi. Pokušaj ponovo.', 'Zatvori', { duration: 4000 });
      }
    });
  }

  private saveSong(): void {
    if (!this.rezultat) return;

    this.saving = true;

    const payload = {
      title: this.naslov || 'Nepoznata pesma',
      artist: this.izvodjac || 'Nepoznat izvođač',
      lyrics: this.rezultat,
      genre: '',
      keySignature: '',
      capo: 0,
      isPrivate: true,
    } as unknown as Song;

    this.songService.createSong(payload).subscribe({
      next: (song) => {
        this.savedSongId = song.id;
        this.saving = false;
        this.snackBar.open('Pesma sačuvana u tvoj profil!', 'Zatvori', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Analiza uspešna, ali greška pri čuvanju.', 'Zatvori', { duration: 4000 });
      }
    });
  }

  goToSong(): void {
    if (this.savedSongId) {
      this.router.navigate(['/songs', this.savedSongId]);
    }
  }
}