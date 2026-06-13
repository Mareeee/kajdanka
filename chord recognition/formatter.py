import bisect


def _word_index_for_time(starts: list[float], time: float) -> int:
    idx = bisect.bisect_right(starts, time) - 1
    return max(idx, 0)


def format_verse(words: list[str], positions: list[int], chords_with_idx: list[tuple[int, dict]]) -> str:
    if not words:
        return ""

    word_line = " ".join(words)
    chord_line = list(" " * len(word_line))

    next_free = 0

    for idx_word, chord_info in chords_with_idx:
        if not (0 <= idx_word < len(words)):
            continue

        chord_text = chord_info["chord"]
        if chord_text == "N":
            continue

        pos = max(positions[idx_word], next_free)

        if pos >= len(word_line):
            continue

        for j, ch in enumerate(chord_text):
            target = pos + j
            if target < len(chord_line):
                chord_line[target] = ch
            else:
                chord_line.append(ch)

        next_free = pos + len(chord_text) + 1

    chord_str = "".join(chord_line).rstrip()
    if chord_str.strip():
        return chord_str + "\n" + word_line
    return word_line


def format(transcript: list[dict], chords: list[dict], title: str = "") -> str:
    if not transcript:
        return ""

    starts = [seg["start"] for seg in transcript]

    filtered = []
    for i, c in enumerate(chords):
        if i + 1 < len(chords) and chords[i + 1]["time"] - c["time"] < 1.0:
            continue
        filtered.append(c)
    chords = filtered

    start_idx = 0
    for i, c in enumerate(chords):
        if c["time"] <= starts[0]:
            start_idx = i
        else:
            break
    chords = chords[start_idx:]

    chord_indices = [
        (_word_index_for_time(starts, c["time"]), c)
        for c in chords
    ]

    verses = _divide_per_verses(transcript)

    lines = []
    word_offset = 0
    for verse in verses:
        words = [seg["word"].strip() for seg in verse]

        positions = []
        offset = 0
        for word in words:
            positions.append(offset)
            offset += len(word) + 1

        verse_chords = [
            (idx - word_offset, c)
            for idx, c in chord_indices
            if word_offset <= idx < word_offset + len(verse)
        ]

        lines.append(format_verse(words, positions, verse_chords))
        lines.append("")

        word_offset += len(verse)

    content = "\n".join(lines).strip()
    return content


def _divide_per_verses(segments: list[dict], pause_threshold: float = 1.5) -> list[list[dict]]:
    if not segments:
        return []

    verses = []
    current = [segments[0]]

    for seg in segments[1:]:
        pause = seg["start"] - current[-1]["end"]
        if pause >= pause_threshold:
            verses.append(current)
            current = [seg]
        else:
            current.append(seg)

    if current:
        verses.append(current)

    return verses