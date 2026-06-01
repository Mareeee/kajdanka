import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SetlistService } from '../../core/services/setlist.service';
import { SongCardComponent } from '../../shared/components/song-card/song-card';
import { User } from '../../core/models/user.model';
import { Setlist } from '../../core/models/setlist.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, SongCardComponent
  ]
})
export class ProfileComponent implements OnInit {

  profile: User | null = null;
  setlists: Setlist[] = [];
  loading = true;

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private setlistService = inject(SetlistService);
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
      this.authService.currentUser()?.username === this.route.snapshot.paramMap.get('username')) {
      this.setlistService.getMySetlists().subscribe({
        next: setlists => { this.setlists = setlists; },
        error: () => { }
      });
    }
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