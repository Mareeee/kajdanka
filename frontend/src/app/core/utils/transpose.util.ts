export type ChordNotation = 'sharp' | 'flat';

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const ENHARMONIC: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
    'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B'
};

const CHORD_RE = /^[A-H](#|b)?[^\s\/]*(\/[A-H](#|b)?[^\s]*)?$/;

function isChord(token: string): boolean {
    return CHORD_RE.test(token.trim());
}

function noteToIndex(note: string): number {
    const normalized = ENHARMONIC[note] || note;
    return NOTES_SHARP.indexOf(normalized);
}

export function changeNotation(chord: string, notation: ChordNotation): string {
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;

    const root = match[1];
    const rest = match[2] || '';

    const idx = noteToIndex(root);
    if (idx === -1) return chord;

    const newRoot = notation === 'flat' ? NOTES_FLAT[idx] : NOTES_SHARP[idx];
    return `${newRoot}${rest}`;
}

function isChordLine(line: string): boolean {
    const tokens = line.trim().split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) return false;
    if (tokens[0].startsWith('[') && tokens[0].endsWith(']')) return false;
    return tokens.every(isChord);
}

export function transposeChord(chord: string, semitones: number): string {
    if (semitones === 0) return chord;

    const match = chord.match(/^([A-G][#b]?)(.*?)(\/([A-G][#b]?))?$/);
    if (!match) return chord;

    const root = ENHARMONIC[match[1]] || match[1];
    const quality = match[2] || '';
    const bassNote = match[4] ? (ENHARMONIC[match[4]] || match[4]) : null;

    const rootIdx = NOTES_SHARP.indexOf(root);
    if (rootIdx === -1) return chord;

    const newRoot = NOTES_SHARP[(rootIdx + semitones + 120) % 12];

    if (bassNote) {
        const bassIdx = NOTES_SHARP.indexOf(bassNote);
        const newBass = NOTES_SHARP[(bassIdx + semitones + 120) % 12];
        return `${newRoot}${quality}/${newBass}`;
    }

    return `${newRoot}${quality}`;
}

export function transposeLyrics(lyrics: string, semitones: number): string {
    if (semitones === 0) return lyrics;
    return lyrics
        .split('\n')
        .map(line => {
            if (isChordLine(line)) {
                return line.split(/(\s+)/).map(part =>
                    isChord(part) ? transposeChord(part, semitones) : part
                ).join('');
            }
            return line.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChord(chord, semitones)}]`);
        })
        .join('\n');
}

export function applyNotation(lyrics: string, notation: ChordNotation): string {
    return lyrics
        .split('\n')
        .map(line => {
            if (isChordLine(line)) {
                return line.split(/(\s+)/).map(part =>
                    isChord(part) ? changeNotation(part, notation) : part
                ).join('');
            }
            return line.replace(/\[([^\]]+)\]/g, (_, chord) => `[${changeNotation(chord, notation)}]`);
        })
        .join('\n');
}

export function parseLyrics(lyrics: string): Array<Array<{ chord: string | null; text: string }>> {
    const rawLines = lyrics.split('\n');
    const result: Array<Array<{ chord: string | null; text: string }>> = [];

    let i = 0;
    while (i < rawLines.length) {
        const line = rawLines[i];

        if (line.trim() === '') {
            result.push([{ chord: null, text: '' }]);
            i++;
            continue;
        }

        if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
            result.push([{ chord: null, text: line }]);
            i++;
            continue;
        }

        if (isChordLine(line)) {
            const nextLine = rawLines[i + 1];
            const hasTextBelow = nextLine !== undefined
                && nextLine.trim() !== ''
                && !isChordLine(nextLine)
                && !(nextLine.trim().startsWith('[') && nextLine.trim().endsWith(']'));

            const chordTokens = line.trim().split(/\s+/);

            if (hasTextBelow) {
                const textLine = rawLines[i + 1];
                const segments = mergeChordAndTextLine(line, textLine);
                result.push(segments);
                i += 2;
            } else {
                const segments = chordTokens.map(ch => ({ chord: ch, text: '' }));
                result.push(segments);
                i++;
            }
        } else {
            result.push([{ chord: null, text: line }]);
            i++;
        }
    }

    return result;
}

function mergeChordAndTextLine(
    chordLine: string,
    textLine: string
): Array<{ chord: string | null; text: string }> {

    const chordPositions: Array<{ chord: string; pos: number }> = [];
    const chordTokenRe = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = chordTokenRe.exec(chordLine)) !== null) {
        if (isChord(m[0])) {
            chordPositions.push({ chord: m[0], pos: m.index });
        }
    }

    if (chordPositions.length === 0) {
        return [{ chord: null, text: textLine }];
    }

    const segments: Array<{ chord: string | null; text: string }> = [];

    if (chordPositions[0].pos > 0) {
        const before = textLine.substring(0, chordPositions[0].pos);
        if (before.trim()) {
            segments.push({ chord: null, text: before });
        }
    }

    for (let j = 0; j < chordPositions.length; j++) {
        const { chord, pos } = chordPositions[j];
        const nextPos = chordPositions[j + 1]?.pos ?? Infinity;

        const slice = textLine.substring(pos, nextPos === Infinity ? undefined : nextPos);

        segments.push({ chord, text: slice || '' });
    }

    return segments;
}

export function extractUniqueChords(lyrics: string): string[] {
    const found = new Set<string>();

    for (const line of lyrics.split('\n')) {
        if (isChordLine(line)) {
            line.trim().split(/\s+/).forEach(t => { if (isChord(t)) found.add(t); });
        } else {
            const matches = line.match(/\[([^\]]+)\]/g) ?? [];
            matches.map(m => m.replace(/[\[\]]/g, '')).forEach(c => found.add(c));
        }
    }

    return [...found];
}