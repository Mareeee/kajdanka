import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { SongService } from '../../core/services/song.service';
import { SongSummary } from '../../core/models/song.model';
import { SongCardComponent } from '../../shared/components/song-card/song-card';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, SongCardComponent
  ]
})
export class HomeComponent implements OnInit {
  featuredSongs: SongSummary[] = [];
  searchQuery = '';
  loading = true;

  constructor(
    private songService: SongService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.songService.getFeatured(8).subscribe({
      next: songs => {
        this.featuredSongs = songs;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/songs'], {
        queryParams: { search: this.searchQuery }
      });
    }
  }
}