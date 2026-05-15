import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
})
export class NavbarComponent {

  constructor(public authService: AuthService) { }

  logout(): void {
    this.authService.logout();
  }
}