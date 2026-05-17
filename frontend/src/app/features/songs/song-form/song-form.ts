import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Song } from '../../../core/models/song.model';

const GENRES = ['Rock', 'Pop', 'Folk', 'Blues', 'Jazz', 'Metal', 'Country', 'Klasika', 'Ostalo'];
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Cm', 'Dm', 'Em', 'Am', 'Bm', 'Fm', 'Gm'];

@Component({
  selector: 'app-song-form',
  standalone: true,
  templateUrl: './song-form.html',
  styleUrls: ['./song-form.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatProgressSpinnerModule
  ]
})
export class SongFormComponent implements OnInit {

  @Input() initialData: Partial<Song> | null = null;
  @Input() loading = false;
  @Input() submitLabel = 'Sačuvaj';

  @Output() formSubmit = new EventEmitter<Song>();

  readonly genres = GENRES;
  readonly keys = KEYS;
  form!: FormGroup;

  constructor(private fb: FormBuilder) {

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      artist: ['', [Validators.required, Validators.maxLength(200)]],
      genre: [''],
      keySignature: [''],
      capo: [0, [Validators.min(0), Validators.max(11)]],
      lyrics: ['']
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.getRawValue() as Song);
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';
    if (control.errors['required']) return 'Ovo polje je obavezno';
    if (control.errors['maxlength']) return `Maksimalno ${control.errors['maxlength'].requiredLength} karaktera`;
    if (control.errors['min']) return 'Kapo ne može biti negativan';
    if (control.errors['max']) return 'Kapo ne može biti veći od 11';
    return '';
  }
}