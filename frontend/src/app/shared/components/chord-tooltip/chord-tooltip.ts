import {
  Component, Input, OnChanges, ViewChild,
  ElementRef, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChordData, CHORD_DATABASE, drawChordDiagram } from '../../../core/utils/chord.diagram.util';

@Component({
  selector: 'app-chord-tooltip',
  standalone: true,
  templateUrl: './chord-tooltip.html',
  styleUrls: ['./chord-tooltip.scss'],
  imports: [CommonModule]
})
export class ChordTooltipComponent implements OnChanges, AfterViewChecked {
  @Input() chord = '';
  @Input() x = 0;
  @Input() y = 0;
  @Input() visible = false;

  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  chordData: ChordData | null = null;
  private needsDraw = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnChanges(): void {
    this.chordData = CHORD_DATABASE[this.chord] ?? null;
    if (this.visible && this.chordData) {
      this.needsDraw = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.needsDraw && this.canvasRef && this.chordData) {
      this.needsDraw = false;
      drawChordDiagram(this.canvasRef.nativeElement, this.chordData);
    }
  }
}