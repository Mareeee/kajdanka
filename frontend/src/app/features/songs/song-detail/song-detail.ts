import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SongService } from '../../../core/services/song.service';
import { Song } from '../../../core/models/song.model';
import { ChordDisplayComponent } from '../../../shared/components/chord-display/chord-display';
import { transposeLyrics, extractUniqueChords } from '../../../core/utils/transpose.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { LikeService } from '../../../core/services/like.service';
import { CommentService } from '../../../core/services/comment.service';
import { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  templateUrl: './song-detail.html',
  styleUrls: ['./song-detail.scss'],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatSliderModule, MatProgressSpinnerModule, MatDividerModule,
    ChordDisplayComponent, ReactiveFormsModule, FormsModule
  ]
})
export class SongDetailComponent implements OnInit {
  song: Song | null = null;
  loading = true;
  semitones = 0;
  liked = false;
  commentInput: string = '';

  protected authService = inject(AuthService);
  private songService = inject(SongService);
  private likeService = inject(LikeService);
  private commentService = inject(CommentService);
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
        next: liked => {
          this.liked = liked;
        },
        error: () => { this.liked = false; }
      });
    } else {
      this.liked = false;
    }
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
    return extractUniqueChords(this.transposedLyrics);
  }

  changeSemitones(delta: number): void {
    this.semitones = Math.max(-6, Math.min(6, this.semitones + delta));
  }

  resetTranspose(): void {
    this.semitones = 0;
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
        liked ? this.song!.likeCount++ : this.song!.likeCount--
      },
      error: () => { }
    })
  }

  sendComment(): void {
    var comment: string = this.commentInput.trim()
    if (!comment) return;

    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    this.commentInput = '';

    this.commentService.sendComment(this.song!.id, comment).subscribe({
      next: (comments) => {
        this.song!.comments = comments;
      },
    })
  }

  deleteComment(commentId: number): void {
    console.log(commentId)
    this.commentService.deleteComment(this.song!.id, commentId).subscribe({
      next: (comments) => {

        this.song!.comments = comments;
      }, error(err) {
        console.log(err);
      },
    })
  }
}