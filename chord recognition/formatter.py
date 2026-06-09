def _vreme_u_rec(segmenti: list[dict], vreme: float) -> int:
    for i, seg in enumerate(segmenti):
        if seg["start"] <= vreme < seg["end"]:
            return i
    return len(segmenti) - 1

def formatiraj_strofu(segmenti: list[dict], akordi: list[dict]) -> str:
    if not segmenti:
        return ""

    reci = [seg["word"].strip() for seg in segmenti]
    tekst_linija = " ".join(reci)

    pozicije = []
    offset = 0
    for rec in reci:
        pozicije.append(offset)
        offset += len(rec) + 1

    chord_linija = [" "] * len(tekst_linija)

    for akord_info in akordi:
        idx_reci = _vreme_u_rec(segmenti, akord_info["time"])
        if idx_reci < len(pozicije):
            pos = pozicije[idx_reci]
            for j, ch in enumerate(akord_info["chord"]):
                target = pos + j
                if target < len(chord_linija):
                    chord_linija[target] = ch
                else:
                    chord_linija.append(ch)

    chord_str = "".join(chord_linija).rstrip()
    if chord_str.strip():
        return chord_str + "\n" + tekst_linija
    return tekst_linija

def formatiraj_izlaz(transkript: list[dict], akordi: list[dict], naslov: str = "") -> str:
    strofe = _podeli_na_strofe(transkript)

    linije = []
    for strofa in strofe:
        akordi_strofe = [
            a for a in akordi
            if strofa[0]["start"] <= a["time"] <= strofa[-1]["end"]
        ]

        linije.append(formatiraj_strofu(strofa, akordi_strofe))
        linije.append("")

    sadrzaj = "\n".join(linije).strip()

    if naslov:
        zaglavlje = f'"{naslov}","Kajdanka AI"\n'
        return zaglavlje + sadrzaj

    return sadrzaj

def _podeli_na_strofe(segmenti: list[dict], pauza_sekundi: float = 1.5) -> list[list[dict]]:
    if not segmenti:
        return []

    strofe = []
    trenutna = [segmenti[0]]

    for seg in segmenti[1:]:
        pauza = seg["start"] - trenutna[-1]["end"]
        if pauza >= pauza_sekundi:
            strofe.append(trenutna)
            trenutna = [seg]
        else:
            trenutna.append(seg)

    if trenutna:
        strofe.append(trenutna)

    return strofe
