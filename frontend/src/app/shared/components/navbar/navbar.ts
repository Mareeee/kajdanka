import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, FormsModule],
})

export class NavbarComponent {

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  searchQuery = '';

  protected isRouterReady = signal(false);
  protected isOnHomePage = signal(true);
  protected isOnSongsPage = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const onHome = e.urlAfterRedirects.endsWith('/');
      const onSongs = e.urlAfterRedirects.startsWith('/songs');

      this.isOnHomePage.set(onHome);
      this.isOnSongsPage.set(onSongs);
      this.isRouterReady.set(true);

      if (!onSongs) {
        this.searchQuery = '';
      }
    });
  }

  search(): void {
    const q = this.searchQuery.trim();
    this.router.navigate(['/songs'], { queryParams: { search: q } });
  }

  clearSearch(): void {
    this.searchQuery = '';
    if (this.router.url.startsWith('/songs')) {
      this.router.navigate(['/songs']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}