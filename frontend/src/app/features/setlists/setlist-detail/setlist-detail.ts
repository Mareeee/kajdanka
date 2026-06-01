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
import { SetlistDetail } from '../../../core/models/setlist.model';
import { Song } from '../../../core/models/song.model';

@Component({
  selector: 'app-setlist-detail',
  standalone: true,
  templateUrl: './setlist-detail.html',
  styleUrls: ['./setlist-detail.scss'],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatProgressSpinnerModule
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

  private route = inject(ActivatedRoute);
  private setlistService = inject(SetlistService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.setlistService.getSetlist(id).subscribe({
      next: setlist => {
        this.setlist = setlist;
        this.loading = false;
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

  removeSong(song: Song): void {
    if (!this.setlist) return;
    this.setlistService.removeSong(this.setlist.id, song.id).subscribe({
      next: updated => {
        this.setlist = updated;
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
