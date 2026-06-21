import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SetlistService } from '../../core/services/setlist.service';
import { SongService } from '../../core/services/song.service';
import { SongCardComponent } from '../../shared/components/song-card/song-card';
import { User } from '../../core/models/user.model';
import { Setlist } from '../../core/models/setlist.model';
import { Song } from '../../core/models/song.model';

type Tab = 'songs' | 'liked' | 'setlists' | 'recent';
type ViewMode = 'cards' | 'list';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, SongCardComponent
  ]
})
export class ProfileComponent implements OnInit {

  profile: User | null = null;
  setlists: Setlist[] = [];
  likedSongs: Song[] = [];
  recentSongs: Song[] = [];
  loading = true;

  activeTab = signal<Tab>('songs');
  viewMode = signal<ViewMode>('list');

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private setlistService = inject(SetlistService);
  private songService = inject(SongService);
  public authService = inject(AuthService);

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');
    this.userService.getProfile(username!).subscribe({
      next: profile => {
        this.profile = profile;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    if (this.authService.isLoggedIn() &&
      this.authService.currentUser()?.username === username) {
      this.setlistService.getMySetlists().subscribe({
        next: setlists => { this.setlists = setlists; },
        error: () => { }
      });
      this.songService.getRecentlyViewed().subscribe({
        next: songs => { this.recentSongs = songs; },
        error: () => { }
      });
    }
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  openSong(song: Song): void {
    this.router.navigate(['/songs', song.id]);
  }

  logout(): void {
    this.authService.logout();
  }

  get isOwnProfile(): boolean {
    return this.authService.isLoggedIn() &&
      this.authService.currentUser()?.username === this.profile?.username;
  }

  get avatarInitials(): string {
    return this.profile?.username?.slice(0, 2).toUpperCase() ?? '??';
  }
}