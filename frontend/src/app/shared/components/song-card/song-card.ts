import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { SongSummary } from '../../../core/models/song.model';

@Component({
  selector: 'app-song-card',
  standalone: true,
  templateUrl: './song-card.html',
  styleUrls: ['./song-card.scss'],
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule]
})
export class SongCardComponent {
  @Input({ required: true }) song!: SongSummary;
}