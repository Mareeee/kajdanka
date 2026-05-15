export interface ChordData {
    name: string;
    frets: number[];
    fingers: number[];
    barre?: { fret: number; from: number; to: number };
    startFret?: number;
}

export const CHORD_DATABASE: Record<string, ChordData> = {
    'C': { name: 'C Major', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    'Cm': { name: 'C Minor', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, from: 0, to: 5 }, startFret: 3 },
    'D': { name: 'D Major', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    'Dm': { name: 'D Minor', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    'D7': { name: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
    'E': { name: 'E Major', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    'Em': { name: 'E Minor', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    'E7': { name: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
    'F': { name: 'F Major', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 0, to: 5 } },
    'Fm': { name: 'F Minor', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 0, to: 5 } },
    'G': { name: 'G Major', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    'Gm': { name: 'G Minor', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 0, to: 5 }, startFret: 3 },
    'G7': { name: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
    'A': { name: 'A Major', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    'Am': { name: 'A Minor', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    'A7': { name: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
    'Am7': { name: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
    'B': { name: 'B Major', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },
    'Bm': { name: 'B Minor', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },
    'B7': { name: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },

    'H': { name: 'H (B Major)', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },
    'Hm': { name: 'Hm (Bm)', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 1, to: 5 }, startFret: 2 },
    'H7': { name: 'H7 (B7)', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },

    'C#': { name: 'C# Major', frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 4, from: 1, to: 5 }, startFret: 4 },
    'C#m': { name: 'C# Minor', frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, from: 1, to: 5 }, startFret: 4 },
    'D#': { name: 'D# Major', frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], startFret: 1 },
    'D#m': { name: 'D# Minor', frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2], startFret: 1 },
    'F#': { name: 'F# Major', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 2, from: 0, to: 5 }, startFret: 2 },
    'F#m': { name: 'F# Minor', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, from: 0, to: 5 }, startFret: 2 },
    'G#': { name: 'G# Major', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 4, from: 0, to: 5 }, startFret: 4 },
    'G#m': { name: 'G# Minor', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 4, from: 0, to: 5 }, startFret: 4 },
    'A#': { name: 'A# Major', frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, from: 1, to: 5 }, startFret: 1 },
    'A#m': { name: 'A# Minor', frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 1, from: 1, to: 5 }, startFret: 1 },

    'C7': { name: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
    'F7': { name: 'F7', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 0, to: 5 } },
    'G#7': { name: 'G#7', frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 4, from: 0, to: 5 }, startFret: 4 },

    'Asus2': { name: 'Asus2', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
    'Asus4': { name: 'Asus4', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
    'Dsus4': { name: 'Dsus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
    'Dsus2': { name: 'Dsus2', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
    'Esus4': { name: 'Esus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
    'Cmaj7': { name: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
    'Fmaj7': { name: 'Fmaj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
    'Gmaj7': { name: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },
    'Amaj7': { name: 'Amaj7', frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
};

const W = 120;
const H = 140;
const NUT_H = 6;

const STRINGS = 6;
const FRETS_SHOWN = 4;

const MARGIN_LEFT = 22;
const MARGIN_TOP = 28;
const MARGIN_BOTTOM = 20;

const GRID_W = W - MARGIN_LEFT - 14;
const GRID_H = H - MARGIN_TOP - MARGIN_BOTTOM;

const STRING_SPACING = GRID_W / (STRINGS - 1);
const FRET_SPACING = GRID_H / FRETS_SHOWN;
const DOT_R = STRING_SPACING * 0.32;

export function drawChordDiagram(canvas: HTMLCanvasElement, data: ChordData): void {
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);

    const startFret = data.startFret ?? 1;
    const isOpenPosition = startFret === 1;

    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(data.name, W / 2, 13);

    const gridTop = MARGIN_TOP;

    if (isOpenPosition) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(MARGIN_LEFT - 1, gridTop, GRID_W + 2, NUT_H);
    } else {
        ctx.fillStyle = '#666';
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${startFret}fr`, MARGIN_LEFT - 4, gridTop + FRET_SPACING * 0.6);
    }

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    const nutOffset = isOpenPosition ? NUT_H : 0;

    for (let f = 0; f <= FRETS_SHOWN; f++) {
        const y = gridTop + nutOffset + f * FRET_SPACING;
        ctx.beginPath();
        ctx.moveTo(MARGIN_LEFT, y);
        ctx.lineTo(MARGIN_LEFT + GRID_W, y);
        ctx.stroke();
    }

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    for (let s = 0; s < STRINGS; s++) {
        const x = MARGIN_LEFT + s * STRING_SPACING;
        ctx.beginPath();
        ctx.moveTo(x, gridTop + nutOffset);
        ctx.lineTo(x, gridTop + nutOffset + FRETS_SHOWN * FRET_SPACING);
        ctx.stroke();
    }

    if (data.barre) {
        const { fret, from, to } = data.barre;
        const relFret = fret - startFret + 1;
        const y = gridTop + nutOffset + (relFret - 0.5) * FRET_SPACING;
        const x1 = MARGIN_LEFT + from * STRING_SPACING;
        const x2 = MARGIN_LEFT + to * STRING_SPACING;

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = '#1565c0';
        ctx.lineWidth = DOT_R * 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.lineCap = 'butt';
    }

    for (let s = 0; s < STRINGS; s++) {
        const fret = data.frets[s];
        const x = MARGIN_LEFT + s * STRING_SPACING;

        if (fret === -1) {
            ctx.strokeStyle = '#e53935';
            ctx.lineWidth = 1.5;
            const xt = x;
            const yt = gridTop - 7;
            const d = 4;
            ctx.beginPath(); ctx.moveTo(xt - d, yt - d); ctx.lineTo(xt + d, yt + d); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(xt + d, yt - d); ctx.lineTo(xt - d, yt + d); ctx.stroke();
        } else if (fret === 0) {
            ctx.strokeStyle = '#1565c0';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, gridTop - 7, 4, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            const relFret = fret - startFret + 1;
            const y = gridTop + nutOffset + (relFret - 0.5) * FRET_SPACING;

            const isOnBarre = data.barre
                && data.barre.fret === fret
                && s >= data.barre.from
                && s <= data.barre.to;

            if (!isOnBarre) {
                ctx.fillStyle = '#1565c0';
                ctx.beginPath();
                ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
                ctx.fill();
            }

            if (data.fingers[s] > 0 && !isOnBarre) {
                ctx.fillStyle = 'white';
                ctx.font = `bold ${DOT_R * 1.2}px "Courier New", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(data.fingers[s]), x, y);
                ctx.textBaseline = 'alphabetic';
            }
        }
    }
}