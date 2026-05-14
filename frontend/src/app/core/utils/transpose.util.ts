const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ENHARMONIC: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
    'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B'
};

export function transposeChord(chord: string, semitones: number): string {
    if (semitones === 0) return chord;

    const match = chord.match(/^([A-G][#b]?)(.*?)(\/([A-G][#b]?))?$/);
    if (!match) return chord;

    const root = ENHARMONIC[match[1]] || match[1];
    const quality = match[2] || '';
    const bassNote = match[4] ? (ENHARMONIC[match[4]] || match[4]) : null;

    const rootIdx = NOTES.indexOf(root);
    if (rootIdx === -1) return chord;

    const newRoot = NOTES[(rootIdx + semitones + 120) % 12];

    if (bassNote) {
        const bassIdx = NOTES.indexOf(bassNote);
        const newBass = NOTES[(bassIdx + semitones + 120) % 12];
        return `${newRoot}${quality}/${newBass}`;
    }

    return `${newRoot}${quality}`;
}

export function transposeLyrics(lyrics: string, semitones: number): string {
    if (semitones === 0) return lyrics;
    return lyrics.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChord(chord, semitones)}]`);
}

export function parseLyrics(lyrics: string): Array<Array<{ chord: string | null; text: string }>> {
    const lines = lyrics.split('\n');

    return lines.map(line => {
        const segments: Array<{ chord: string | null; text: string }> = [];
        const chordRegex = /\[([^\]]+)\]([^\[]*)/g;
        let match: RegExpExecArray | null;
        let lastIndex = 0;

        const firstBracket = line.indexOf('[');
        if (firstBracket > 0) {
            segments.push({ chord: null, text: line.substring(0, firstBracket) });
            lastIndex = firstBracket;
        }

        while ((match = chordRegex.exec(line)) !== null) {
            segments.push({ chord: match[1], text: match[2] });
        }

        if (segments.length === 0) {
            segments.push({ chord: null, text: line });
        }

        return segments;
    });
}