import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseLyrics } from '../../../core/utils/transpose.util';

@Component({
  selector: 'app-chord-display',
  standalone: true,
  templateUrl: './chord-display.html',
  styleUrls: ['./chord-display.scss'],
  imports: [CommonModule]
})
export class ChordDisplayComponent implements OnChanges {
  @Input() lyrics = '';

  parsedLines: Array<Array<{ chord: string | null; text: string }>> = [];

  ngOnChanges(): void {
    this.parsedLines = this.lyrics ? parseLyrics(this.lyrics) : [];
  }
}