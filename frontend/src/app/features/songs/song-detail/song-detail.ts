import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SongService } from '../../../core/services/song.service';
import { SetlistService } from '../../../core/services/setlist.service';
import { Song } from '../../../core/models/song.model';
import { Setlist } from '../../../core/models/setlist.model';
import { ChordDisplayComponent } from '../../../shared/components/chord-display/chord-display';
import { transposeLyrics, extractUniqueChords, applyNotation, ChordNotation } from '../../../core/utils/transpose.util';
import { downloadSongPdf } from '../../../core/utils/pdf.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { LikeService } from '../../../core/services/like.service';
import { CommentService } from '../../../core/services/comment.service';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  templateUrl: './song-detail.html',
  styleUrls: ['./song-detail.scss'],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatSliderModule, MatProgressSpinnerModule, MatDividerModule,
    MatMenuModule, ChordDisplayComponent, ReactiveFormsModule, FormsModule
  ]
})
export class SongDetailComponent implements OnInit, OnDestroy {
  song: Song | null = null;
  loading = true;
  semitones = 0;
  notation: ChordNotation = 'sharp';
  scrolling = false;
  private scrollInterval: any = null;
  private autoScrolling = false;
  liked = false;
  commentInput: string = '';
  setlists: Setlist[] = [];

  protected authService = inject(AuthService);
  private songService = inject(SongService);
  private likeService = inject(LikeService);
  private commentService = inject(CommentService);
  private setlistService = inject(SetlistService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.songService.getSong(id).subscribe({
      next: song => {
        this.song = song;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    if (this.authService.currentUser()) {
      this.likeService.isLikedByUser(id).subscribe({
        next: liked => { this.liked = liked; },
        error: () => { this.liked = false; }
      });
      this.setlistService.getMySetlists().subscribe({
        next: setlists => { this.setlists = setlists; },
        error: () => { }
      });
    } else {
      this.liked = false;
    }
  }

  get transposedLyrics(): string {
    if (!this.song?.lyrics) return '';
    const transposed = transposeLyrics(this.song.lyrics, this.semitones);
    return applyNotation(transposed, this.notation);
  }

  setNotation(notation: ChordNotation): void {
    this.notation = notation;
  }

  get transposeLabel(): string {
    if (this.semitones === 0) return 'Original';
    return `${this.semitones > 0 ? '+' : ''}${this.semitones} polutonova`;
  }

  get uniqueChords(): string[] {
    if (!this.transposedLyrics) return [];
    return extractUniqueChords(this.transposedLyrics);
  }

  changeSemitones(delta: number): void {
    this.semitones = Math.max(-12, Math.min(12, this.semitones + delta));
  }

  resetTranspose(): void {
    this.semitones = 0;
  }

  toggleScroll(): void {
    if (this.scrolling) {
      clearInterval(this.scrollInterval);
      this.scrolling = false;
      return;
    }

    this.scrolling = true;
    this.scrollInterval = setInterval(() => {
      this.autoScrolling = true;
      window.scrollBy(0, 1);
    }, 50);
  }

  downloadPdf(): void {
    if (!this.song) return;
    downloadSongPdf(this.song, this.transposedLyrics);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.autoScrolling) {
      this.autoScrolling = false;
      return;
    }

    if (this.scrolling) {
      clearInterval(this.scrollInterval);
      this.scrolling = false;
    }
  }

  ngOnDestroy(): void {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  get isOwner(): boolean {
    const username = this.authService.currentUser()?.username;
    return !!username && username === this.song?.authorUsername;
  }

  confirmDelete(): void {
    const ok = confirm(`Obrisati pesmu "${this.song?.title}"? Ova akcija je nepovratna.`);
    if (!ok || !this.song) return;

    this.songService.deleteSong(this.song.id).subscribe({
      next: () => {
        this.snackBar.open('Pesma obrisana.', 'Zatvori', { duration: 3000 });
        this.router.navigate(['/songs']);
      },
      error: () => {
        this.snackBar.open('Greška pri brisanju.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  like(): void {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    this.likeService.setLiked(this.song!.id).subscribe({
      next: liked => {
        this.liked = liked;
        liked ? this.song!.likeCount++ : this.song!.likeCount--;
      },
      error: () => { }
    });
  }

  addToSetlist(setlist: Setlist): void {
    this.setlistService.addSong(setlist.id, this.song!.id).subscribe({
      next: () => {
        this.snackBar.open(`Dodato u "${setlist.name}"`, 'Zatvori', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Greška pri dodavanju.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  sendComment(): void {
    var comment: string = this.commentInput.trim();
    if (!comment) return;

    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    this.commentInput = '';

    this.commentService.sendComment(this.song!.id, comment).subscribe({
      next: (comments) => { this.song!.comments = comments; },
    });
  }

  deleteComment(commentId: number): void {
    this.commentService.deleteComment(this.song!.id, commentId).subscribe({
      next: (comments) => { this.song!.comments = comments; },
      error(err) { console.log(err); }
    });
  }
}