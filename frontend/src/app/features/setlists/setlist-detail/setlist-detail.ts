import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SetlistService } from '../../../core/services/setlist.service';
import { SongService } from '../../../core/services/song.service';
import { SetlistDetail } from '../../../core/models/setlist.model';
import { Song } from '../../../core/models/song.model';
import { ChordDisplayComponent } from '../../../shared/components/chord-display/chord-display';
import { transposeLyrics, applyNotation } from '../../../core/utils/transpose.util';

@Component({
  selector: 'app-setlist-detail',
  standalone: true,
  templateUrl: './setlist-detail.html',
  styleUrls: ['./setlist-detail.scss'],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatProgressSpinnerModule,
    ChordDisplayComponent
  ]
})
export class SetlistDetailComponent implements OnInit {

  setlist: SetlistDetail | null = null;
  loading = true;
  searchQuery = '';

  editMode = false;
  editName = '';
  editDescription = '';
  saving = false;

  activeSong: Song | null = null;
  activeSongFull: Song | null = null;
  loadingSong = false;

  private route = inject(ActivatedRoute);
  private setlistService = inject(SetlistService);
  private songService = inject(SongService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.setlistService.getSetlist(id).subscribe({
      next: setlist => {
        this.setlist = setlist;
        this.loading = false;
        if (setlist.songs.length > 0) {
          this.selectSong(setlist.songs[0]);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  get filteredSongs(): Song[] {
    if (!this.setlist) return [];
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.setlist.songs;
    return this.setlist.songs.filter(s =>
      s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }

  selectSong(song: Song): void {
    this.activeSong = song;
    this.activeSongFull = null;
    this.loadingSong = true;
    this.songService.getSong(song.id).subscribe({
      next: full => {
        this.activeSongFull = full;
        this.loadingSong = false;
      },
      error: () => { this.loadingSong = false; }
    });
  }

  get transposedLyrics(): string {
    if (!this.activeSongFull?.lyrics) return '';
    return applyNotation(transposeLyrics(this.activeSongFull.lyrics, 0), 'sharp');
  }

  removeSong(song: Song): void {
    if (!this.setlist) return;
    this.setlistService.removeSong(this.setlist.id, song.id).subscribe({
      next: updated => {
        this.setlist = updated;
        if (this.activeSong?.id === song.id) {
          this.activeSong = null;
          this.activeSongFull = null;
          if (updated.songs.length > 0) {
            this.selectSong(updated.songs[0]);
          }
        }
        this.snackBar.open('Pesma uklonjena.', 'Zatvori', { duration: 2500 });
      },
      error: () => {
        this.snackBar.open('Greška pri uklanjanju.', 'Zatvori', { duration: 2500 });
      }
    });
  }

  startEdit(): void {
    if (!this.setlist) return;
    this.editName = this.setlist.name;
    this.editDescription = this.setlist.description ?? '';
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  saveEdit(): void {
    if (!this.setlist || !this.editName.trim()) return;
    this.saving = true;
    this.setlistService.updateSetlist(this.setlist.id, this.editName.trim(), this.editDescription.trim()).subscribe({
      next: updated => {
        this.setlist!.name = updated.name;
        this.setlist!.description = updated.description;
        this.editMode = false;
        this.saving = false;
        this.snackBar.open('Setlista ažurirana.', 'Zatvori', { duration: 2500 });
      },
      error: () => {
        this.snackBar.open('Greška pri čuvanju.', 'Zatvori', { duration: 2500 });
        this.saving = false;
      }
    });
  }
}