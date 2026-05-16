import { Component, afterNextRender, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        @if (loading) {
          <mat-spinner />
        } @else if (success) {
          <mat-icon color="primary">check_circle</mat-icon>
          <h2>Nalog aktiviran!</h2>
          <p>Preusmeravamo te...</p>
        } @else {
          <mat-icon color="warn">error</mat-icon>
          <h2>Greška</h2>
          <p>{{ errorMessage }}</p>
          <a routerLink="/register">Registruj se ponovo</a>
        }
      </div>
    </div>
  `
})
export class VerifyEmailComponent {
  loading = true;
  success = false;
  errorMessage = '';

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    afterNextRender(() => {
      const token = this.route.snapshot.queryParams['token'];
      this.http.get<AuthResponse>(`/auth/verify-email?token=${token}`)
        .subscribe({
          next: (response) => {
            this.authService.handleVerificationResponse(response);
            this.loading = false;
            this.success = true;
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = err.error?.error || 'Token nije validan ili je istekao.';
          }
        });
    });
  }
}