import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { SongService } from '../../../core/services/song.service';
import { SongFormComponent } from '../song-form/song-form';
import { SongSummary } from '../../../core/models/song.model';

@Component({
    selector: 'app-song-create',
    templateUrl: './song-create.html',
    styleUrls: ['./song-create.scss'],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatSnackBarModule, SongFormComponent],
})
export class SongCreateComponent {

    loading = false;

    constructor(
        private songService: SongService,
        private snackBar: MatSnackBar,
        public router: Router
    ) { }

    onCreate(payload: SongSummary): void {
        this.loading = true;
        this.songService.createSong(payload).subscribe({
            next: song => {
                this.snackBar.open('Pesma uspešno sačuvana!', 'Zatvori', { duration: 3000 });
                this.router.navigate(['/songs', song.id]);
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Greška pri čuvanju. Pokušaj ponovo.', 'Zatvori', { duration: 3000 });
            }
        });
    }
}