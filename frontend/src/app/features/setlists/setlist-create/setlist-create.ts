import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SetlistService } from '../../../core/services/setlist.service';

@Component({
  selector: 'app-setlist-create',
  standalone: true,
  templateUrl: './setlist-create.html',
  styleUrls: ['./setlist-create.scss'],
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule
  ]
})
export class SetlistCreateComponent {

  name = '';
  description = '';
  loading = false;

  private setlistService = inject(SetlistService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  submit(): void {
    if (!this.name.trim()) return;
    this.loading = true;
    this.setlistService.createSetlist(this.name.trim(), this.description.trim()).subscribe({
      next: () => {
        this.snackBar.open('Setlista kreirana!', 'Zatvori', { duration: 3000 });
        this.router.navigate(['/profile', JSON.parse(localStorage.getItem('user')!).username]);
      },
      error: () => {
        this.snackBar.open('Greška pri kreiranju.', 'Zatvori', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}