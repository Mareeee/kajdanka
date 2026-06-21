import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SongService } from '../../../core/services/song.service';
import { LikeService } from '../../../core/services/like.service';
import { AuthService } from '../../../core/services/auth.service';
import { Song } from '../../../core/models/song.model';
import { SongCardComponent } from '../../../shared/components/song-card/song-card';
import { extractUniqueChords } from '../../../core/utils/transpose.util';

type ViewMode = 'cards' | 'list';

interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-song-list',
  standalone: true,
  templateUrl: './song-list.html',
  styleUrls: ['./song-list.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatPaginatorModule, MatProgressSpinnerModule,
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

  viewMode: ViewMode = 'list';

  sortOptions: SortOption[] = [
    { value: 'newest', label: 'Najnovije' },
    { value: 'oldest', label: 'Najstarije' },
    { value: 'title', label: 'Naziv (A-Z)' },
    { value: 'popular', label: 'Najpopularnije' }
  ];
  selectedSort: SortOption = this.sortOptions[0];

  likedSongIds = new Set<number>();

  constructor(
    private songService: SongService,
    private likeService: LikeService,
    private authService: AuthService,
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
        this.sortSongs();
        this.loadLikedStatus();
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

  get pageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage + 1;
    const delta = 2;

    const range: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    const withDots: (number | string)[] = [];
    let last = 0;
    for (const page of range) {
      if (last) {
        if (page - last === 2) {
          withDots.push(last + 1);
        } else if (page - last > 2) {
          withDots.push('...');
        }
      }
      withDots.push(page);
      last = page;
    }
    return withDots;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage + 1) return;
    this.changePage(page - 1);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  selectSort(option: SortOption): void {
    this.selectedSort = option;
    this.sortSongs();
  }

  private sortSongs(): void {
    const sorted = [...this.songs];

    switch (this.selectedSort.value) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
        sorted.sort((a, b) => b.likeCount - a.likeCount);
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    this.songs = sorted;
  }

  private loadLikedStatus(): void {
    this.likedSongIds.clear();
    if (!this.authService.currentUser()) return;

    this.songs.forEach(song => {
      this.likeService.isLikedByUser(song.id).subscribe({
        next: liked => { if (liked) this.likedSongIds.add(song.id); }
      });
    });
  }

  isLiked(songId: number): boolean {
    return this.likedSongIds.has(songId);
  }

  toggleLike(song: Song, event: Event): void {
    event.stopPropagation();

    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    this.likeService.setLiked(song.id).subscribe({
      next: liked => {
        if (liked) {
          this.likedSongIds.add(song.id);
          song.likeCount++;
        } else {
          this.likedSongIds.delete(song.id);
          song.likeCount = Math.max(0, song.likeCount - 1);
        }
      }
    });
  }

  getChordCount(song: Song): number {
    return song.lyrics ? extractUniqueChords(song.lyrics).length : 0;
  }

  formatViews(count: number): string {
    if (count === null || count === undefined) return '0';
    if (count >= 1000) {
      const value = count / 1000;
      const rounded = Math.round(value * 10) / 10;
      return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}K`;
    }
    return String(count);
  }

  openSong(song: Song): void {
    this.router.navigate(['/songs', song.id]);
  }
}