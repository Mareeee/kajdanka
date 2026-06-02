import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ROOT_NOTES,
  CHORD_TYPES,
  ChordType,
  ComputedChord,
  computeChordVariations,
} from './../../core/utils/chord.shapes.util';
import { ChordAudioService } from '../../core/services/chord-audio.service';

const FRETS_DISPLAYED = 16;
const FRET_NUMBERS = Array.from({ length: FRETS_DISPLAYED }, (_, i) => i);
const STRING_LABELS = ['E', 'B', 'G', 'D', 'A', 'E'];

interface FretCell {
  fret: number;
  active: boolean;
  open: boolean;
  muted: boolean;
  finger: number;
  isXS: boolean;
  isBarre: boolean;
  isBarreFirst: boolean;
  isBarreLast: boolean;
  isBarreMid: boolean;
}

interface StringRow {
  label: string;
  openCell: { open: boolean; muted: boolean };
  cells: FretCell[];
  lineOpacity: number;
}

interface BarreInfo {
  fret: number;
  finger: number;
  topRow: number;
  bottomRow: number;
}

@Component({
  selector: 'app-chords',
  standalone: true,
  templateUrl: './chords.html',
  styleUrls: ['./chords.scss'],
  imports: [CommonModule],
})
export class ChordsComponent implements OnInit {
  private readonly audioService = inject(ChordAudioService);

  readonly rootNotes = ROOT_NOTES;
  readonly chordTypes = CHORD_TYPES;
  readonly fretNumbers = FRET_NUMBERS;
  readonly stringLabels = STRING_LABELS;

  readonly fretmarks = new Set([3, 5, 7, 9, 12, 15]);
  readonly doubleFretmarks = new Set([12]);

  selectedRoot = signal<string>('C');
  selectedType = signal<ChordType>('Major');
  selectedVariation = signal<number>(0);

  variations = computed<ComputedChord[]>(() =>
    computeChordVariations(this.selectedRoot(), this.selectedType())
  );

  activeChord = computed<ComputedChord | null>(() => {
    const vars = this.variations();
    const idx = this.selectedVariation();
    return vars[idx] ?? vars[0] ?? null;
  });

  chordTitle = computed<string>(() => {
    const chord = this.activeChord();
    if (!chord) return '';
    const typeSuffix = chord.type === 'Major' ? '' : chord.type;
    return `${chord.root} ${typeSuffix}`;
  });

  stringRows = computed<StringRow[]>(() => {
    const chord = this.activeChord();
    if (!chord) return [];

    const { frets, fingers } = chord;
    const stringOrder = [5, 4, 3, 2, 1, 0];

    const barre = this.detectBarre(frets, fingers, stringOrder);

    return stringOrder.map((stringIdx, rowIdx) => {
      const fretValue = frets[stringIdx];
      const fingerValue = fingers[stringIdx];
      const isMuted = fretValue === -1;
      const isOpen = fretValue === 0;

      const isBarreRow =
        barre !== null && rowIdx >= barre.topRow && rowIdx <= barre.bottomRow;

      const cells: FretCell[] = FRET_NUMBERS.map(fretNum => {
        const isThisBarreCell =
          isBarreRow && barre !== null && fretNum === barre.fret;
        const isBarreFirst = isThisBarreCell && rowIdx === barre!.topRow;
        const isBarreLast = isThisBarreCell && rowIdx === barre!.bottomRow;
        const isBarreMid = isThisBarreCell && !isBarreFirst && !isBarreLast;

        const isNonBarreActive =
          !isMuted && !isOpen && fretValue === fretNum && !isThisBarreCell;

        return {
          fret: fretNum,
          active: isNonBarreActive,
          open: false,
          muted: false,
          finger: fingerValue,
          isXS: fretNum >= 8,
          isBarre: isThisBarreCell,
          isBarreFirst,
          isBarreLast,
          isBarreMid,
        };
      });

      return {
        label: STRING_LABELS[rowIdx],
        openCell: { open: isOpen, muted: isMuted },
        cells,
        lineOpacity: isMuted ? 0.25 : 1,
      };
    });
  });

  ngOnInit(): void {
    this.ensureVariationInRange();
  }

  playChord(): void {
    const chord = this.activeChord();
    if (!chord) return;
    this.audioService.playChord(chord.frets);
  }

  selectRoot(root: string): void {
    this.selectedRoot.set(root);
    this.selectedVariation.set(0);
  }

  selectType(type: ChordType): void {
    this.selectedType.set(type);
    this.selectedVariation.set(0);
  }

  selectVariation(index: number): void {
    this.selectedVariation.set(index);
  }

  isRootActive(root: string): boolean {
    return this.selectedRoot() === root;
  }

  isTypeActive(type: ChordType): boolean {
    return this.selectedType() === type;
  }

  isVariationActive(index: number): boolean {
    return this.selectedVariation() === index;
  }

  isFretmark(fret: number): boolean {
    return this.fretmarks.has(fret);
  }

  isDoubleFretmark(fret: number): boolean {
    return this.doubleFretmarks.has(fret);
  }

  getStringRows(): StringRow[] {
    return this.stringRows();
  }

  private detectBarre(
    frets: number[],
    fingers: number[],
    stringOrder: number[]
  ): BarreInfo | null {
    const fingerFretMap = new Map<number, { fret: number; strings: number[] }>();

    for (let i = 0; i < fingers.length; i++) {
      const f = fingers[i];
      const fr = frets[i];
      if (f <= 0 || fr <= 0) continue;

      if (!fingerFretMap.has(f)) {
        fingerFretMap.set(f, { fret: fr, strings: [] });
      }

      const entry = fingerFretMap.get(f)!;
      if (entry.fret === fr) {
        entry.strings.push(i);
      }
    }

    let bestBarre: BarreInfo | null = null;

    for (const [finger, { fret, strings }] of fingerFretMap) {
      if (strings.length < 2) continue;

      const rowIndices = strings
        .map(stringIdx => stringOrder.indexOf(stringIdx))
        .filter(r => r !== -1)
        .sort((a, b) => a - b);

      if (rowIndices.length < 2) continue;

      const candidate: BarreInfo = {
        fret,
        finger,
        topRow: rowIndices[0],
        bottomRow: rowIndices[rowIndices.length - 1],
      };

      if (
        bestBarre === null ||
        candidate.bottomRow - candidate.topRow >
        bestBarre.bottomRow - bestBarre.topRow
      ) {
        bestBarre = candidate;
      }
    }

    return bestBarre;
  }

  private ensureVariationInRange(): void {
    const vars = this.variations();
    if (this.selectedVariation() >= vars.length) {
      this.selectedVariation.set(0);
    }
  }
}