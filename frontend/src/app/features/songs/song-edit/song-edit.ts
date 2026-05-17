import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { SongService } from '../../../core/services/song.service';
import { Song } from '../../../core/models/song.model';
import { SongFormComponent } from '../song-form/song-form';

@Component({
    selector: 'app-song-edit',
    templateUrl: './song-edit.html',
    styleUrls: ['./song-edit.scss'],
    standalone: true,
    imports: [CommonModule, MatSnackBarModule, MatProgressSpinnerModule, MatIconModule, SongFormComponent],
})
export class SongEditComponent implements OnInit {

    song: Song | null = null;
    loadingPage = true;
    loadingSave = false;

    private route = inject(ActivatedRoute);
    private songService = inject(SongService);
    private snackBar = inject(MatSnackBar);
    public router = inject(Router);

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.songService.getSong(id).subscribe({
            next: song => {
                this.song = song;
                this.loadingPage = false;
            },
            error: () => {
                this.loadingPage = false;
                this.snackBar.open('Pesma nije pronađena.', 'Zatvori', { duration: 3000 });
                this.router.navigate(['/songs']);
            }
        });
    }

    onUpdate(payload: Song): void {
        if (!this.song) return;
        this.loadingSave = true;

        this.songService.updateSong(this.song.id, payload).subscribe({
            next: () => {
                this.snackBar.open('Pesma uspešno izmenjena!', 'Zatvori', { duration: 3000 });
                this.router.navigate(['/songs', this.song!.id]);
            },
            error: (err) => {
                this.loadingSave = false;
                const msg = err.status === 403
                    ? 'Nemate dozvolu za ovu akciju.'
                    : 'Greška pri čuvanju. Pokušaj ponovo.';
                this.snackBar.open(msg, 'Zatvori', { duration: 4000 });
            }
        });
    }
}