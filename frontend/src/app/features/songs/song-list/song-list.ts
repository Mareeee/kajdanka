import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SongService } from '../../../core/services/song.service';
import { Song } from '../../../core/models/song.model';
import { SongCardComponent } from '../../../shared/components/song-card/song-card';

@Component({
  selector: 'app-song-list',
  standalone: true,
  templateUrl: './song-list.html',
  styleUrls: ['./song-list.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatPaginatorModule, MatProgressSpinnerModule,
    SongCardComponent
  ]
})
export class SongListComponent implements OnInit {

  songs: Song[] = [];
  genres: string[] = [];
  loading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 12;
  selectedGenre = '';

  activeSearch = '';

  searchControl = new FormControl('');

  constructor(
    private songService: SongService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const search = params['search'] ?? '';
      this.activeSearch = search;

      this.searchControl.setValue(search, { emitEvent: false });
      this.currentPage = 0;
      this.loadSongs();
    });
  }

  loadSongs(): void {
    this.loading = true;
    this.songService.searchSongs({
      search: this.searchControl.value ?? '',
      genre: this.selectedGenre,
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: page => {
        this.songs = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadSongs();
  }

  clearFilters(): void {
    this.selectedGenre = '';
    this.activeSearch = '';
    this.currentPage = 0;
    this.router.navigate(['/songs']);
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize) || 1;
  }

  changePage(newPage: number): void {
    this.currentPage = newPage;
    this.loadSongs();
  }
}