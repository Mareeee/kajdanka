import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseLyrics } from '../../../core/utils/transpose.util';
import { ChordTooltipComponent } from '../chord-tooltip/chord-tooltip';

@Component({
  selector: 'app-chord-display',
  standalone: true,
  templateUrl: './chord-display.html',
  styleUrls: ['./chord-display.scss'],
  imports: [CommonModule, ChordTooltipComponent]
})
export class ChordDisplayComponent implements OnChanges {
  @Input() lyrics = '';

  parsedLines: Array<Array<{ chord: string | null; text: string }>> = [];

  hoveredChord = '';
  tooltipX = 0;
  tooltipY = 0;
  tooltipVisible = false;

  ngOnChanges(): void {
    this.parsedLines = this.lyrics ? parseLyrics(this.lyrics) : [];
  }

  onChordHover(event: MouseEvent, chord: string): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.hoveredChord = chord;
    this.tooltipX = rect.left + rect.width / 2;
    this.tooltipY = rect.top;
    this.tooltipVisible = true;
  }

  onChordLeave(): void {
    this.tooltipVisible = false;
  }
}