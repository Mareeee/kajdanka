import jsPDF from 'jspdf';
import { Song } from '../models/song.model';
import { parseLyrics } from './transpose.util';
import { DEJAVU_SANS_MONO_REGULAR_BASE64 } from '../../assets/fonts/dejavu-sans-mono-regular.font';
import { DEJAVU_SANS_MONO_BOLD_BASE64 } from '../../assets/fonts/dejavu-sans-mono-bold.font';

let fontsRegistered = false;

function registerFonts(doc: jsPDF): void {
    if (fontsRegistered) return;

    doc.addFileToVFS('DejaVuSansMono-Regular.ttf', DEJAVU_SANS_MONO_REGULAR_BASE64);
    doc.addFont('DejaVuSansMono-Regular.ttf', 'DejaVuSansMono', 'normal');

    doc.addFileToVFS('DejaVuSansMono-Bold.ttf', DEJAVU_SANS_MONO_BOLD_BASE64);
    doc.addFont('DejaVuSansMono-Bold.ttf', 'DejaVuSansMono', 'bold');

    fontsRegistered = true;
}

export function downloadSongPdf(song: Song, lyrics: string): void {
    const doc = new jsPDF();
    registerFonts(doc);

    const marginLeft = 15;
    const lineHeight = 5;
    const pageHeight = doc.internal.pageSize.getHeight();

    let y = 20;

    doc.setFont('DejaVuSansMono', 'bold');
    doc.setFontSize(18);
    doc.text(song.title, marginLeft, y);
    y += 8;

    doc.setFont('DejaVuSansMono', 'normal');
    doc.setFontSize(12);
    doc.text(`Izvođač: ${song.artist}`, marginLeft, y);
    y += 6;

    doc.text(`Dodao/la: ${song.authorUsername}`, marginLeft, y);
    y += 10;

    doc.setFontSize(10);

    const parsedLines = parseLyrics(lyrics);

    for (const segments of parsedLines) {
        const hasChords = segments.some(s => s.chord);

        if (hasChords) {
            let chordLine = '';
            let textLine = '';

            for (const segment of segments) {
                const chordText = segment.chord || '';
                const lineText = segment.text || '';
                const width = Math.max(chordText.length, lineText.length) + 1;

                chordLine += chordText.padEnd(width, ' ');
                textLine += lineText.padEnd(width, ' ');
            }

            if (y > pageHeight - 15) {
                doc.addPage();
                y = 20;
            }
            doc.text(chordLine, marginLeft, y);
            y += lineHeight;

            if (y > pageHeight - 15) {
                doc.addPage();
                y = 20;
            }
            doc.text(textLine, marginLeft, y);
            y += lineHeight;
        } else {
            const text = segments[0]?.text || '';

            if (y > pageHeight - 15) {
                doc.addPage();
                y = 20;
            }
            doc.text(text, marginLeft, y);
            y += lineHeight;
        }
    }

    doc.save(`${song.title} - ${song.artist}.pdf`);
}