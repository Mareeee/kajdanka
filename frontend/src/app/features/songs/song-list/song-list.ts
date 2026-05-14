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
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SongService } from '../../../core/services/song.service';
import { SongSummary } from '../../../core/models/song.model';
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
    MatChipsModule, SongCardComponent
  ]
})
export class SongListComponent implements OnInit {
  songs: SongSummary[] = [];
  genres: string[] = [];
  loading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 12;
  selectedGenre = '';

  searchControl = new FormControl('');

  constructor(
    private songService: SongService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchControl.setValue(params['search'], { emitEvent: false });
      }
      this.loadSongs();
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadSongs();
    });

    this.songService.getGenres().subscribe(g => this.genres = g);
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

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSongs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.selectedGenre = '';
    this.currentPage = 0;
    this.loadSongs();
  }
}