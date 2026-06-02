export type ChordType =
    | 'Major' | 'Minor' | '7' | '5' | 'dim' | 'dim7' | 'aug'
    | 'sus2' | 'sus4' | 'maj7' | 'm7' | '7sus4';

export interface MovableShape {
    type: ChordType;
    label: string;
    baseShape: string;
    frets: number[];
    fingers: number[];
    openFingers?: number[];
    rootString: number;
    special?: boolean;
}

export interface ComputedChord {
    root: string;
    type: ChordType;
    frets: number[];
    fingers: number[];
    startFret: number;
    label: string;
    baseShape: string;
}

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const OPEN_STRING_NOTES: Record<number, string> = {
    0: 'E',
    1: 'A',
    2: 'D',
    3: 'G',
    4: 'B',
    5: 'E',
};

const MOVABLE_SHAPES: MovableShape[] = [
    {
        type: 'Major',
        label: 'E-shape',
        baseShape: 'E',
        frets: [0, 2, 2, 1, 0, 0],
        fingers: [1, 3, 4, 2, 1, 1],
        openFingers: [0, 2, 3, 1, 0, 0],
        rootString: 0,
    },
    {
        type: 'Major',
        label: 'G-shape',
        baseShape: 'G',
        frets: [3, 2, 0, 0, 0, 3],
        fingers: [2, 1, 0, 0, 0, 3],
        rootString: 0,
        special: true,
    },
    {
        type: 'Major',
        label: 'A-shape',
        baseShape: 'A',
        frets: [-1, 0, 2, 2, 2, 0],
        fingers: [-1, 1, 2, 3, 4, 1],
        openFingers: [-1, 0, 1, 2, 3, 0],
        rootString: 1,
    },
    {
        type: 'Major',
        label: 'D-shape',
        baseShape: 'D',
        frets: [-1, -1, 0, 2, 3, 2],
        fingers: [-1, 0, 1, 2, 4, 3],
        openFingers: [-1, -1, 0, 1, 3, 2],
        rootString: 2,
    },
    {
        type: 'Major',
        label: 'C-shape',
        baseShape: 'C',
        frets: [-1, 3, 2, 0, 1, 0],
        fingers: [-1, 4, 3, 1, 2, 1],
        openFingers: [-1, 3, 2, 0, 1, 0],
        rootString: 1,
    },
    {
        type: 'Minor',
        label: 'Em-shape',
        baseShape: 'Em',
        frets: [0, 2, 2, 0, 0, 0],
        fingers: [1, 3, 4, 1, 1, 1],
        openFingers: [0, 2, 3, 0, 0, 0],
        rootString: 0,
    },
    {
        type: 'Minor',
        label: 'Am-shape',
        baseShape: 'Am',
        frets: [-1, 0, 2, 2, 1, 0],
        fingers: [-1, 1, 3, 4, 2, 1],
        openFingers: [-1, 0, 2, 3, 1, 0],
        rootString: 1,
    },
    {
        type: 'Minor',
        label: 'Dm-shape',
        baseShape: 'Dm',
        frets: [-1, -1, 0, 2, 3, 1],
        fingers: [-1, -1, 1, 3, 4, 2],
        openFingers: [-1, -1, 0, 2, 3, 1],
        rootString: 2,
    },
    {
        type: '7',
        label: 'E7-shape',
        baseShape: 'E7',
        frets: [0, 2, 0, 1, 0, 0],
        fingers: [1, 3, 1, 2, 1, 1],
        openFingers: [0, 2, 0, 1, 0, 0],
        rootString: 0,
    },
    {
        type: '7',
        label: 'A7-shape',
        baseShape: 'A7',
        frets: [-1, 0, 2, 0, 2, 0],
        fingers: [-1, 1, 3, 1, 4, 1],
        openFingers: [-1, 0, 1, 0, 2, 0],
        rootString: 1,
    },
    {
        type: '7',
        label: 'D7-shape',
        baseShape: 'D7',
        frets: [-1, -1, 0, 2, 1, 2],
        fingers: [-1, -1, 1, 3, 2, 4],
        openFingers: [-1, -1, 0, 2, 1, 3],
        rootString: 2,
    },
    {
        type: '7',
        label: 'G7-shape',
        baseShape: 'G',
        frets: [3, 2, 0, 0, 0, 1],
        fingers: [3, 2, 0, 0, 0, 1],
        rootString: 0,
        special: true,
    },
    {
        type: '7',
        label: 'B7-shape',
        baseShape: 'B',
        frets: [-1, 2, 1, 2, 0, 2],
        fingers: [-1, 2, 1, 3, 0, 4],
        rootString: 1,
        special: true,
    },
    {
        type: 'maj7',
        label: 'Emaj7-shape',
        baseShape: 'Emaj7',
        frets: [0, 2, 1, 1, 0, 0],
        fingers: [1, 4, 2, 3, 1, 1],
        openFingers: [0, 3, 1, 2, 0, 0],
        rootString: 0,
    },
    {
        type: 'maj7',
        label: 'Amaj7-shape',
        baseShape: 'Amaj7',
        frets: [-1, 0, 2, 1, 2, 0],
        fingers: [-1, 1, 3, 2, 4, 1],
        openFingers: [-1, 0, 2, 1, 3, 0],
        rootString: 1,
    },
    {
        type: 'maj7',
        label: 'Dmaj7-shape',
        baseShape: 'Dmaj7',
        frets: [-1, -1, 0, 2, 2, 2],
        fingers: [-1, -1, 1, 3, 3, 3],
        openFingers: [-1, -1, 0, 1, 1, 1],
        rootString: 2,
    },
    {
        type: 'm7',
        label: 'Em7-shape',
        baseShape: 'Em7',
        frets: [0, 2, 0, 0, 0, 0],
        fingers: [1, 3, 1, 1, 1, 1],
        openFingers: [0, 2, 0, 0, 0, 0],
        rootString: 0,
    },
    {
        type: 'm7',
        label: 'Am7-shape',
        baseShape: 'Am7',
        frets: [-1, 0, 2, 0, 1, 0],
        fingers: [-1, 1, 3, 1, 2, 1],
        openFingers: [-1, 0, 2, 0, 1, 0],
        rootString: 1,
    },
    {
        type: 'm7',
        label: 'Dm7-shape',
        baseShape: 'Dm7',
        frets: [-1, -1, 0, 2, 1, 1],
        fingers: [-1, -1, 1, 4, 2, 3],
        openFingers: [-1, -1, 0, 3, 1, 2],
        rootString: 2,
    },
    {
        type: 'dim',
        label: 'Edim-shape',
        baseShape: 'Edim',
        frets: [0, 1, 2, 0, -1, -1],
        fingers: [1, 2, 3, 1, -1, -1],
        openFingers: [0, 1, 2, 0, -1, -1],
        rootString: 0,
    },
    {
        type: 'dim',
        label: 'Adim-shape',
        baseShape: 'Adim',
        frets: [-1, 0, 1, 2, 1, -1],
        fingers: [-1, 1, 2, 4, 3, -1],
        openFingers: [-1, 0, 1, 3, 2, -1],
        rootString: 1,
    },
    {
        type: 'dim7',
        label: 'dim7-shape-E',
        baseShape: 'dim7E',
        frets: [-1, 1, 2, 0, 2, -1],
        fingers: [-1, 2, 3, 1, 4, -1],
        openFingers: [-1, 1, 2, 0, 3, -1],
        rootString: 2,
    },
    {
        type: 'dim7',
        label: 'dim7-shape-A',
        baseShape: 'dim7A',
        frets: [2, -1, 1, 2, 1, -1],
        fingers: [2, -1, 1, 3, 1, 0],
        openFingers: [2, -1, 1, 3, 1, 0],
        rootString: 1,
    },
    {
        type: 'aug',
        label: 'Eaug-shape',
        baseShape: 'Eaug',
        frets: [-1, -1, 2, 1, 1, 0],
        fingers: [-1, -1, 4, 2, 3, 1],
        openFingers: [-1, -1, 3, 1, 2, 0],
        rootString: 2,
    },
    {
        type: 'aug',
        label: 'Aaug-shape',
        baseShape: 'Aaug',
        frets: [-1, -1, 2, 1, 1, 0],
        fingers: [-1, -1, 4, 2, 3, 1],
        openFingers: [-1, -1, 3, 1, 2, 0],
        rootString: 1,
    },
    {
        type: 'sus2',
        label: 'Asus2-shape',
        baseShape: 'Asus2',
        frets: [-1, 0, 2, 2, 0, 0],
        fingers: [-1, 1, 3, 4, 1, 1],
        openFingers: [-1, 0, 2, 3, 0, 0],
        rootString: 1,
    },
    {
        type: 'sus2',
        label: 'Dsus2-shape',
        baseShape: 'Dsus2',
        frets: [-1, -1, 0, 2, 3, 0],
        fingers: [-1, -1, 1, 3, 4, 1],
        openFingers: [-1, -1, 0, 1, 2, 0],
        rootString: 2,
    },
    {
        type: 'sus4',
        label: 'Asus4-shape',
        baseShape: 'Asus4',
        frets: [-1, 0, 2, 2, 3, 0],
        fingers: [-1, 1, 2, 3, 4, 1],
        openFingers: [-1, 0, 1, 2, 3, 0],
        rootString: 1,
    },
    {
        type: 'sus4',
        label: 'Dsus4-shape',
        baseShape: 'Dsus4',
        frets: [-1, -1, 0, 2, 3, 3],
        fingers: [-1, -1, 1, 3, 4, 4],
        openFingers: [-1, -1, 0, 1, 2, 3],
        rootString: 2,
    },
    {
        type: '5',
        label: 'E5-shape',
        baseShape: 'E5',
        frets: [0, 2, 2, -1, -1, -1],
        fingers: [1, 3, 4, -1, -1, -1],
        openFingers: [0, 2, 3, -1, -1, -1],
        rootString: 0,
    },
    {
        type: '5',
        label: 'A5-shape',
        baseShape: 'A5',
        frets: [-1, 0, 2, 2, -1, -1],
        fingers: [-1, 1, 3, 4, -1, -1],
        openFingers: [-1, 0, 2, 3, -1, -1],
        rootString: 1,
    },
    {
        type: '7sus4',
        label: 'A7sus4-shape',
        baseShape: 'A7sus4',
        frets: [-1, 0, 2, 0, 3, 0],
        fingers: [-1, 1, 3, 1, 4, 1],
        openFingers: [-1, 0, 2, 0, 4, 0],
        rootString: 1,
    },
    {
        type: '7sus4',
        label: 'E7sus4-shape',
        baseShape: 'E7sus4',
        frets: [0, 2, 0, 2, 0, 0],
        fingers: [1, 3, 1, 4, 1, 1],
        openFingers: [0, 1, 0, 2, 0, 0],
        rootString: 0,
    },
];

function getNoteIndex(note: string): number {
    return ROOT_NOTES.indexOf(note);
}

function computeFretShift(targetRoot: string, stringIndex: number, baseFretOnRoot: number): number {
    const openIdx = getNoteIndex(OPEN_STRING_NOTES[stringIndex]);
    const noteAtBase = (openIdx + baseFretOnRoot) % 12;
    const rootIdx = getNoteIndex(targetRoot);
    return (rootIdx - noteAtBase + 12) % 12;
}

export function computeChordVariations(root: string, type: ChordType): ComputedChord[] {
    const shapes = MOVABLE_SHAPES.filter(s => s.type === type);
    const results: ComputedChord[] = [];

    for (const shape of shapes) {
        let shiftedFrets: number[];
        let fingers: number[];
        let shift = 0;

        if (shape.special) {
            if (root !== shape.baseShape) {
                continue;
            }
            shiftedFrets = [...shape.frets];
            fingers = [...shape.fingers];
        } else {
            const baseFretOnRoot = shape.frets[shape.rootString];
            shift = computeFretShift(root, shape.rootString, baseFretOnRoot);
            shiftedFrets = shape.frets.map(f => {
                if (f === -1) return -1;
                return f + shift;
            });
            fingers = (shift === 0 && shape.openFingers) ? shape.openFingers : shape.fingers;
        }

        const maxFret = Math.max(...shiftedFrets.filter(f => f !== -1));
        if (maxFret > 17) continue;

        const pressedFrets = shiftedFrets.filter(f => f > 0);
        const minPressed = pressedFrets.length > 0 ? Math.min(...pressedFrets) : 0;
        const startFret = minPressed > 1 ? minPressed : 1;

        results.push({
            root,
            type,
            frets: shiftedFrets,
            fingers,
            startFret,
            label: shape.label,
            baseShape: shape.baseShape,
        });
    }

    results.sort((a, b) => {
        const minA = Math.min(...a.frets.filter(f => f >= 0));
        const minB = Math.min(...b.frets.filter(f => f >= 0));
        return minA - minB;
    });

    return results;
}

export const CHORD_TYPES: { value: ChordType; display: string }[] = [
    { value: 'Major', display: 'Major' },
    { value: 'Minor', display: 'Minor' },
    { value: '7', display: '7' },
    { value: '5', display: '5' },
    { value: 'dim', display: 'dim' },
    { value: 'dim7', display: 'dim7' },
    { value: 'aug', display: 'aug' },
    { value: 'sus2', display: 'sus2' },
    { value: 'sus4', display: 'sus4' },
    { value: 'maj7', display: 'maj7' },
    { value: 'm7', display: 'm7' },
    { value: '7sus4', display: '7sus4' },
];