import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ]
})
export class RegisterComponent {

  loading = false;
  showPassword = false;
  serverError = '';
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.serverError = '';

    const { username, email, password } = this.form.getRawValue();
    this.authService.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => {
        this.snackBar.open('Nalog uspešno kreiran! Dobrodošli!', 'Zatvori', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.serverError = err.error?.error ||
          Object.values(err.error?.fields || {}).join(', ') ||
          'Greška pri registraciji. Pokušajte ponovo.';
      }
    });
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'Ovo polje je obavezno';
    if (errors['email']) return 'Email nije validan';
    if (errors['minlength']) return `Minimalno ${errors['minlength'].requiredLength} karaktera`;
    if (errors['maxlength']) return `Maksimalno ${errors['maxlength'].requiredLength} karaktera`;
    return '';
  }

  get passwordMismatch(): boolean {
    return !!(this.form.errors?.['passwordMismatch'] &&
      this.form.get('confirmPassword')?.touched);
  }
}