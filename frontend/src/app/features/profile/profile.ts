import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SongCardComponent } from '../../shared/components/song-card/song-card';
import { User } from '../../core/models/user.model';

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
  loading = true;

  constructor(
    private userService: UserService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userService.getMyProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatMemberSince(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('sr-RS', {
      month: 'long',
      year: 'numeric'
    });
  }

  get avatarInitials(): string {
    return this.profile?.username?.slice(0, 2).toUpperCase() ?? '??';
  }
}