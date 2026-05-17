import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { SongSummary } from '../../../core/models/song.model';
import { AuthService } from '../../../core/services/auth.service';
import { LikeService } from '../../../core/services/like.service';

@Component({
  selector: 'app-song-card',
  standalone: true,
  templateUrl: './song-card.html',
  styleUrls: ['./song-card.scss'],
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule]
})
export class SongCardComponent {
  private authService = inject(AuthService);
  private likeService = inject(LikeService);

  protected liked = false;

  @Input({ required: true }) song!: SongSummary;

  ngOnInit(): void {
    if (this.authService.currentUser()) {
      this.likeService.isLikedByUser(this.song.id).subscribe({
        next: liked => {
          this.liked = liked;
        },
        error: () => { this.liked = false; }
      });
    } else {
      this.liked = false;
    }
  }
}