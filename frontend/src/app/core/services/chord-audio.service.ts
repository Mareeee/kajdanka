import { Injectable } from '@angular/core';

const OPEN_STRING_FREQUENCIES: Record<number, number> = {
    0: 82.41,
    1: 110.00,
    2: 146.83,
    3: 196.00,
    4: 246.94,
    5: 329.63,
};

const STRUM_DELAY_MS = 65;
const NOTE_DURATION = 2.2;

@Injectable({ providedIn: 'root' })
export class ChordAudioService {

    playChord(frets: number[]): void {
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        const stringOrder = [0, 1, 2, 3, 4, 5];

        const activeFrets = stringOrder
            .map(i => ({ stringIndex: i, fret: frets[i] }))
            .filter(s => s.fret >= 0);

        if (activeFrets.length === 0) {
            ctx.close();
            return;
        }

        activeFrets.forEach(({ stringIndex, fret }, strumIndex) => {
            const openFreq = OPEN_STRING_FREQUENCIES[stringIndex];
            const frequency = openFreq * Math.pow(2, fret / 12);
            const startTime = now + strumIndex * (STRUM_DELAY_MS / 1000);
            this.playNote(ctx, frequency, startTime);
        });

        const totalDuration = NOTE_DURATION + activeFrets.length * (STRUM_DELAY_MS / 1000);
        setTimeout(() => ctx.close(), totalDuration * 1000 + 200);
    }

    private playNote(ctx: AudioContext, frequency: number, startTime: number): void {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, startTime);
        masterGain.gain.linearRampToValueAtTime(0.4, startTime + 0.005);
        masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + NOTE_DURATION);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, startTime);
        filter.frequency.exponentialRampToValueAtTime(120, startTime + NOTE_DURATION);

        masterGain.connect(filter);
        filter.connect(ctx.destination);

        const harmonics: { factor: number; gain: number; type: OscillatorType }[] = [
            { factor: 1, gain: 0.6, type: 'triangle' },
            { factor: 2, gain: 0.3, type: 'triangle' },
            { factor: 3, gain: 0.1, type: 'sine' },
        ];

        harmonics.forEach(h => {
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();

            osc.type = h.type;
            osc.frequency.setValueAtTime(frequency * h.factor, startTime);
            oscGain.gain.setValueAtTime(h.gain, startTime);

            osc.connect(oscGain);
            oscGain.connect(masterGain);

            osc.start(startTime);
            osc.stop(startTime + NOTE_DURATION);
        });
    }
}