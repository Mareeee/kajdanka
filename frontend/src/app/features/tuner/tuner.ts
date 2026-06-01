import { Component, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface GuitarString {
  label: string;
  note: string;
  frequency: number;
  top: string;
  left: string;
}

interface ChromaticNote {
  name: string;
  frequency: number;
}

const GUITAR_STRINGS: GuitarString[] = [
  { label: 'E', note: 'E2', frequency: 82.41, top: '50%', left: '15%' },
  { label: 'A', note: 'A2', frequency: 110.00, top: '34%', left: '15%' },
  { label: 'D', note: 'D3', frequency: 146.83, top: '18%', left: '15%' },
  { label: 'G', note: 'G3', frequency: 196.00, top: '18%', left: '85%' },
  { label: 'B', note: 'B3', frequency: 246.94, top: '34%', left: '85%' },
  { label: 'E', note: 'E4', frequency: 329.63, top: '50%', left: '85%' },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function buildChromaticScale(minFreq: number, maxFreq: number): ChromaticNote[] {
  const notes: ChromaticNote[] = [];
  for (let midi = 0; midi <= 127; midi++) {
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    if (freq >= minFreq && freq <= maxFreq) {
      const octave = Math.floor(midi / 12) - 1;
      const name = NOTE_NAMES[midi % 12] + octave;
      notes.push({ name, frequency: freq });
    }
  }
  return notes;
}

const CHROMATIC_SCALE = buildChromaticScale(60, 1400);

const NOISE_GATE = 0.025;
const IN_TUNE_CENTS = 1;
const SMOOTHING = 0.85;

@Component({
  selector: 'app-tuner',
  standalone: true,
  templateUrl: './tuner.html',
  styleUrls: ['./tuner.scss'],
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class TunerComponent implements OnDestroy {
  readonly strings = GUITAR_STRINGS;

  isListening = signal(false);
  selectedString = signal<GuitarString | null>(null);
  detectedNote = signal<string>('-');
  cents = signal<number>(0);
  hasSignal = signal(false);

  needleAngle = computed(() => {
    const c = this.cents();
    const sel = this.selectedString();
    if (sel) {
      return Math.max(-90, Math.min(90, c * 9));
    }
    return Math.max(-90, Math.min(90, c * 9));
  });

  isInTune = computed(() => this.hasSignal() && Math.abs(this.cents()) <= IN_TUNE_CENTS);

  needleColor = computed(() => {
    if (!this.hasSignal()) return '#94a3b8';
    if (this.isInTune()) return '#22c55e';
    if (Math.abs(this.cents()) <= 25) return '#eab308';
    return '#ef4444';
  });

  centsDisplay = computed(() => {
    const c = this.cents();
    if (!this.hasSignal()) {
      if (c === 0) return '0';
      return c > 0 ? `+${c}` : `${c}`;
    }
    if (this.isInTune()) return '✓';
    if (c === 0) return '0';
    return c > 0 ? `+${c}` : `${c}`;
  });

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationId: number | null = null;
  private buffer = new Float32Array(4096);
  private smoothedCents = 0;

  async toggleListening(): Promise<void> {
    if (this.isListening()) {
      this.stop();
    } else {
      await this.start();
    }
  }

  selectString(s: GuitarString): void {
    if (this.selectedString()?.note === s.note) {
      this.selectedString.set(null);
      this.reset();
      return;
    }
    this.selectedString.set(s);
    this.reset();
    this.playReference(s.frequency);
  }

  playReference(frequency: number): void {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const duration = 2.5;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(1, now + 0.005);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + duration);

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    const harmonics = [
      { factor: 1, gain: 0.6, type: 'triangle' as OscillatorType },
      { factor: 2, gain: 0.3, type: 'triangle' as OscillatorType },
      { factor: 3, gain: 0.1, type: 'sine' as OscillatorType }
    ];

    harmonics.forEach(harmonic => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = harmonic.type;
      osc.frequency.setValueAtTime(frequency * harmonic.factor, now);

      oscGain.gain.setValueAtTime(harmonic.gain, now);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });

    setTimeout(() => {
      ctx.close();
    }, duration * 1000 + 100);
  }

  private async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioContext = new AudioContext();
      await this.audioContext.resume();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096;
      this.buffer = new Float32Array(this.analyser.fftSize);
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
      this.isListening.set(true);
      this.tick();
    } catch {
      this.isListening.set(false);
    }
  }

  private stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.stream?.getTracks().forEach(t => t.stop());
    this.audioContext?.close();
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.isListening.set(false);
    this.reset();
  }

  private reset(): void {
    this.detectedNote.set('-');
    this.cents.set(0);
    this.smoothedCents = 0;
    this.hasSignal.set(false);
  }

  private tick(): void {
    this.animationId = requestAnimationFrame(() => this.tick());
    if (!this.analyser) return;

    this.analyser.getFloatTimeDomainData(this.buffer);

    const rms = Math.sqrt(this.buffer.reduce((s, v) => s + v * v, 0) / this.buffer.length);
    if (rms < NOISE_GATE) {
      this.hasSignal.set(false);
      return;
    }

    const freq = this.autocorrelate(this.buffer, this.audioContext!.sampleRate);
    if (freq <= 0) {
      this.hasSignal.set(false);
      return;
    }

    const focused = this.selectedString();

    if (focused) {
      const rawCents = Math.round((1200 * Math.log2(freq / focused.frequency)) / 10);
      this.smoothedCents = SMOOTHING * this.smoothedCents + (1 - SMOOTHING) * rawCents;
      this.hasSignal.set(true);
      this.detectedNote.set(focused.note);
      this.cents.set(Math.round(this.smoothedCents));
    } else {
      const closest = this.closestChromaticNote(freq);
      const rawCents = Math.round((1200 * Math.log2(freq / closest.frequency)) / 10);
      this.smoothedCents = SMOOTHING * this.smoothedCents + (1 - SMOOTHING) * rawCents;
      this.hasSignal.set(true);
      this.detectedNote.set(closest.name);
      this.cents.set(Math.round(this.smoothedCents));
    }
  }

  private autocorrelate(buf: Float32Array, sampleRate: number): number {
    const n = buf.length;
    const c = new Float32Array(n);

    for (let lag = 0; lag < n; lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += buf[i] * buf[i + lag];
      }
      c[lag] = sum;
    }

    const minLag = Math.floor(sampleRate / 1400);
    const maxLag = Math.ceil(sampleRate / 60);

    let d = minLag;
    while (d < maxLag && c[d] > c[d - 1]) d++;

    let maxVal = -Infinity, maxPos = -1;
    for (let i = d; i < maxLag; i++) {
      if (c[i] > maxVal) {
        maxVal = c[i];
        maxPos = i;
      }
    }

    if (maxPos < 0) return -1;

    let T0 = maxPos;
    const prev = c[T0 - 1] ?? 0;
    const next = c[T0 + 1] ?? 0;
    if (prev !== 0 || next !== 0) {
      T0 = T0 + (next - prev) / (2 * (2 * c[T0] - next - prev));
    }

    return sampleRate / T0;
  }

  private closestChromaticNote(freq: number): ChromaticNote {
    return CHROMATIC_SCALE.reduce((best, note) =>
      Math.abs(Math.log2(freq / note.frequency)) < Math.abs(Math.log2(freq / best.frequency)) ? note : best
    );
  }

  ngOnDestroy(): void {
    this.stop();
  }
}