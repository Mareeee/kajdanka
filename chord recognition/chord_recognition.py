import os
import glob
import json
import bisect
import librosa
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from collections import Counter
import re
import torch.nn.functional as F
from scipy.stats import mode as scipy_mode
from tqdm import tqdm
import time

HOP_LENGTH = 512
SR_CILJNI = 44100
EPOHE = 100
BATCH_SIZE = 32768
STOPA_UCENJA = 0.001
CONTEXT_BEFORE = 32
CONTEXT_AFTER = 8
CONTEXT_TOTAL = CONTEXT_BEFORE + 1 + CONTEXT_AFTER
N_FEATURES = 12 * CONTEXT_TOTAL

PITCHES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
QUALITIES = ["maj", "min"]
IDX_TO_LABEL = [p + ("" if q == "maj" else "m") for q in QUALITIES for p in PITCHES] + ["N"]
LABEL_TO_IDX = {lab: i for i, lab in enumerate(IDX_TO_LABEL)}
N_CLASSES = len(IDX_TO_LABEL)

ENHARMONIC = {
    "B#": "C", "Cb": "B", "E#": "F", "Fb": "E",
    "Db": "C#", "D#": "Eb", "Gb": "F#", "G#": "Ab", "A#": "Bb",
}
ROOT_RE = re.compile(r"^([A-Ga-g])([#b]?)(.*)$")

def normalize_root(root_str):
    if not root_str:
        return None
    letter = root_str[0].upper()
    accidental = root_str[1:] if len(root_str) > 1 else ""
    canonical = letter + accidental
    if canonical in ENHARMONIC:
        return ENHARMONIC[canonical]
    if canonical in PITCHES:
        return canonical
    if len(canonical) == 1 and canonical in "ABCDEFG":
        return canonical
    return None

def reduce_quality(rest):
    rest = rest.split("/")[0].strip().lower()
    if rest.startswith(":"):
        rest = rest[1:]
    rest = re.sub(r"\([^)]*\)", "", rest).strip()
    if not rest:
        return "maj"
    if rest in ("maj", "major"):
        return "maj"
    if rest in ("min", "minor", "m"):
        return "min"
    if rest.startswith(("maj", "major")):
        return "maj"
    if rest.startswith(("min", "minor", "m")):
        return "min"
    if rest.startswith(("dim", "hdim")):
        return "min"
    if rest.startswith("sus"):
        return "maj"
    return "maj"

def chord_label_to_id(label):
    if not label or label.upper() in ("N", "NO CHORD", "X"):
        return LABEL_TO_IDX["N"]
    m = ROOT_RE.match(label.strip())
    if not m:
        return LABEL_TO_IDX["N"]
    letter, accidental, rest = m.groups()
    root = normalize_root(letter.upper() + accidental)
    if root is None:
        return LABEL_TO_IDX["N"]
    q = reduce_quality(rest or "")
    triad = root + ("" if q == "maj" else "m")
    return LABEL_TO_IDX.get(triad, LABEL_TO_IDX["N"])

def transpozicija_labela(labele, n_steps):
    N_IDX = LABEL_TO_IDX["N"]
    rezultat = labele.copy()
    maska = labele != N_IDX
    akordi = labele[maska]
    grupa = akordi // 12
    ton = akordi % 12
    novi_ton = (ton + n_steps) % 12
    rezultat[maska] = grupa * 12 + novi_ton
    return rezultat

def ucitaj_audio(putanja, sr=SR_CILJNI):
    y, sr_out = librosa.load(putanja, sr=sr, mono=True)
    if np.max(np.abs(y)) > 0:
        y = y / np.max(np.abs(y))
    return y, sr_out

def audio_u_hromagram(y, sr):
    C = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=HOP_LENGTH, n_chroma=12)
    C = librosa.util.normalize(C, norm=2, axis=0)
    return C.astype(np.float32)

def napravi_prozore(C_T):
    T = C_T.shape[0]
    padded = np.zeros((CONTEXT_BEFORE + T + CONTEXT_AFTER, 12), dtype=np.float32)
    padded[CONTEXT_BEFORE:CONTEXT_BEFORE + T] = C_T
    windows = np.stack([
        padded[i:i + CONTEXT_TOTAL].reshape(-1)
        for i in range(T)
    ], axis=0)
    return windows

def ucitaj_labele_iz_jams(putanja_jams, vremena):
    with open(putanja_jams, "r", encoding="utf-8") as f:
        sadrzaj = json.load(f)
    chord_anotacije = [a for a in sadrzaj["annotations"] if a.get("namespace") == "chord"]
    if not chord_anotacije:
        return np.full(len(vremena), LABEL_TO_IDX["N"], dtype=np.int64)
    poceci, krajevi, labele_raw = [], [], []
    for obs in chord_anotacije[0]["data"]:
        pocetak = float(obs["time"])
        poceci.append(pocetak)
        krajevi.append(pocetak + float(obs["duration"]))
        labele_raw.append(str(obs["value"]))
    if poceci:
        sort_idx = np.argsort(poceci)
        poceci = [poceci[i] for i in sort_idx]
        krajevi = [krajevi[i] for i in sort_idx]
        labele_raw = [labele_raw[i] for i in sort_idx]
    labele = []
    for t in vremena:
        idx = bisect.bisect_right(poceci, t) - 1
        label = "N"
        if idx >= 0 and poceci[idx] <= t < krajevi[idx]:
            label = labele_raw[idx]
        labele.append(chord_label_to_id(label))
    return np.array(labele, dtype=np.int64)

def _prebroji_frejmove(wav_fajlovi, folder_jams):
    ukupno_frejmova = 0
    vazeci = []
    pbar = tqdm(wav_fajlovi, desc="Prolaz 1/2 | Prebrojavanje", unit="pesma", dynamic_ncols=True)
    for wav_putanja in pbar:
        naziv_sa_sufiksom = os.path.splitext(os.path.basename(wav_putanja))[0]
        naziv_bez_sufiksa = naziv_sa_sufiksom.replace("_mic", "")
        jams_putanja = os.path.join(folder_jams, naziv_bez_sufiksa + ".jams")
        if not os.path.exists(jams_putanja):
            continue
        try:
            y, sr = ucitaj_audio(wav_putanja)
            C = audio_u_hromagram(y, sr)
            T = C.shape[1]
            ukupno_frejmova += T * 7
            vazeci.append((wav_putanja, jams_putanja, naziv_sa_sufiksom))
            pbar.set_postfix({"frejmova": f"{ukupno_frejmova:,}", "vazecih": len(vazeci)})
        except Exception as e:
            tqdm.write(f"  Preskacam {naziv_sa_sufiksom}: {e}")
    return ukupno_frejmova, vazeci

def prikupi_sve_podatke(folder_audio="audio_mono-mic", folder_jams="annotation",
                        putanja_X="X_data.npy", putanja_y="y_data.npy"):
    wav_fajlovi = sorted(glob.glob(os.path.join(folder_audio, "*.wav")))

    ukupno_frejmova, vazeci = _prebroji_frejmove(wav_fajlovi, folder_jams)
    print(f"  Ukupno frejmova (sa augmentacijom): {ukupno_frejmova:,}")

    X_mm = np.lib.format.open_memmap(putanja_X, mode="w+", dtype=np.float32, shape=(ukupno_frejmova, N_FEATURES))
    y_mm = np.lib.format.open_memmap(putanja_y, mode="w+", dtype=np.int64,   shape=(ukupno_frejmova,))

    offset = 0
    pbar = tqdm(vazeci, desc="Prolaz 2/2 | Obrada     ", unit="pesma", dynamic_ncols=True)
    for wav_putanja, jams_putanja, naziv in pbar:
        pbar.set_postfix({"trenutna": naziv[-30:], "frejmova_zapisano": f"{offset:,}"})
        try:
            y_audio, sr = ucitaj_audio(wav_putanja)
            C = audio_u_hromagram(y_audio, sr)
            vremena = np.arange(C.shape[1]) * HOP_LENGTH / sr
            labele = ucitaj_labele_iz_jams(jams_putanja, vremena)
            T = C.shape[1]
            for step in range(-3, 4):
                C_aug = np.roll(C.T, shift=step, axis=1)
                X_aug = napravi_prozore(C_aug)
                y_aug = transpozicija_labela(labele, step)
                X_mm[offset:offset + T] = X_aug
                y_mm[offset:offset + T] = y_aug
                offset += T
        except Exception as e:
            tqdm.write(f"  GRESKA ({naziv}): {e}")

    X_mm.flush()
    y_mm.flush()

    print("\n=== PROCENTUALNA DISTRIBUCIJA KLASA ===")
    brojac = Counter(y_mm[:offset].tolist())
    ukupno_frejmova_stvarno = offset
    for i in range(N_CLASSES):
        br = brojac.get(i, 0)
        proc = (br / ukupno_frejmova_stvarno) * 100 if ukupno_frejmova_stvarno > 0 else 0
        print(f"  Klasa {IDX_TO_LABEL[i]:<5}: {br:>8} frejmova ({proc:.2f}%)")

    return X_mm[:offset], y_mm[:offset]

def ucitaj_kes(putanja_X="X_data.npy", putanja_y="y_data.npy"):
    X = np.lib.format.open_memmap(putanja_X, mode="r")
    y = np.lib.format.open_memmap(putanja_y, mode="r")
    return X, y

class RamovniDataset(Dataset):
    def __init__(self, X, y):
        self.X = X
        self.y = y
    def __len__(self):
        return len(self.X)
    def __getitem__(self, idx):
        x = torch.tensor(self.X[idx], dtype=torch.float32)
        label = torch.tensor(int(self.y[idx]), dtype=torch.long)
        return x, label

class AkordMLP(nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(N_FEATURES, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, n_classes)
        )
    def forward(self, x):
        return self.net(x)

def treniraj_i_sacuvaj(X, y, putanja_modela="test_model.pt"):
    uredjaj = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Uredjaj: {uredjaj}")
    counts = np.bincount(np.array(y, dtype=np.int64), minlength=N_CLASSES).astype(np.float64)
    weights = 1.0 / np.sqrt(counts + 1.0)
    weights = weights / weights.mean()
    dataset = RamovniDataset(X, y)
    loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False,
                        num_workers=0, pin_memory=False)
    model = AkordMLP(n_classes=N_CLASSES).to(uredjaj)
    kriterijum = nn.CrossEntropyLoss(weight=torch.tensor(weights, dtype=torch.float32).to(uredjaj))
    optimizator = optim.Adam(model.parameters(), lr=STOPA_UCENJA, weight_decay=1e-4)
    raspored = optim.lr_scheduler.StepLR(optimizator, step_size=25, gamma=0.5)

    vreme_pocetka = time.time()
    epoha_pbar = tqdm(range(1, EPOHE + 1), desc="Trening", unit="epoha", dynamic_ncols=True)

    for epoha in epoha_pbar:
        model.train()
        ukupan_gubitak, tacno, ukupno = 0.0, 0, 0

        batch_pbar = tqdm(loader, desc=f"  Epoha {epoha:>3}/{EPOHE}", unit="batch",
                          leave=False, dynamic_ncols=True)
        for Xb, yb in batch_pbar:
            Xb, yb = Xb.to(uredjaj), yb.to(uredjaj)
            optimizator.zero_grad()
            izlaz = model(Xb)
            gubitak = kriterijum(izlaz, yb)
            gubitak.backward()
            optimizator.step()
            predvidjanja = izlaz.argmax(dim=1)
            tacno += (predvidjanja == yb).sum().item()
            ukupno += yb.size(0)
            ukupan_gubitak += gubitak.item() * yb.size(0)
            batch_pbar.set_postfix({
                "gubitak": f"{ukupan_gubitak/ukupno:.4f}",
                "tacnost": f"{tacno/ukupno*100:.1f}%"
            })

        raspored.step()
        proslo = time.time() - vreme_pocetka
        preostalo = proslo / epoha * (EPOHE - epoha)
        h, m = divmod(int(preostalo), 3600)
        m, s = divmod(m, 60)
        epoha_pbar.set_postfix({
            "gubitak": f"{ukupan_gubitak/ukupno:.4f}",
            "tacnost": f"{tacno/ukupno*100:.1f}%",
            "lr": f"{raspored.get_last_lr()[0]:.2e}",
            "preostalo": f"{h:02d}:{m:02d}:{s:02d}"
        })

    torch.save(model.state_dict(), putanja_modela)
    print(f"\nModel sacuvan: {putanja_modela}")

def predvidi_akorde(putanja_audio, putanja_modela="test_model.pt"):
    uredjaj = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = AkordMLP(n_classes=N_CLASSES).to(uredjaj)
    model.load_state_dict(torch.load(putanja_modela, map_location=uredjaj))
    model.eval()
    y, sr = ucitaj_audio(putanja_audio)
    C = audio_u_hromagram(y, sr)
    vremena = np.arange(C.shape[1]) * HOP_LENGTH / sr
    X = napravi_prozore(C.T)
    tensor_X = torch.from_numpy(X).to(uredjaj)

    with torch.no_grad():
        izlazi = model(tensor_X)
        probs = F.softmax(izlazi, dim=1).cpu().numpy()

    TRANS_MAT = np.full((N_CLASSES, N_CLASSES), (1.0 - 0.999) / (N_CLASSES - 1))
    np.fill_diagonal(TRANS_MAT, 0.999)

    predvidjanja_id = librosa.sequence.viterbi_discriminative(probs.T, TRANS_MAT)

    T = len(predvidjanja_id)
    PROZOR = 86
    pad = PROZOR // 2
    padded_pred = np.pad(predvidjanja_id, (pad, pad), mode="edge")
    izgladjeno = np.array([
        scipy_mode(padded_pred[i:i + PROZOR], keepdims=True).mode[0]
        for i in range(T)
    ], dtype=np.int64)

    PRAG_POUZDANOSTI = 0.2
    filtrirano_id = []
    trenutni = izgladjeno[0]

    for i, idx in enumerate(izgladjeno):
        if idx != trenutni and probs[i, idx] > PRAG_POUZDANOSTI:
            trenutni = idx
        filtrirano_id.append(trenutni)

    izgladjeno = np.array(filtrirano_id)

    print("\nPredvidjeni akordi kroz vreme:")
    print("-" * 50)
    rezultat = []
    prethodni = None
    for i, idx in enumerate(izgladjeno):
        akord = IDX_TO_LABEL[idx]
        if akord != prethodni:
            rezultat.append({
                "time": float(vremena[i]),
                "chord": akord,
                "confidence": float(probs[i, idx]),
            })
            print(f"  {vremena[i]:6.2f}s  ->  {akord:<6}  (pouzdanost: {probs[i, idx]:.2f})")
            prethodni = akord

    return rezultat

if __name__ == "__main__":
    MODEL = "test_model.pt"
    KES_X, KES_Y = r"D:\chord_kes\X_data.npy", r"D:\chord_kes\y_data.npy"
    if not os.path.exists(MODEL):
        if os.path.exists(KES_X) and os.path.exists(KES_Y):
            print("Ucitavam podatke sa diska (memmap)...")
            svi_X, svi_y = ucitaj_kes(KES_X, KES_Y)
        else:
            svi_X, svi_y = prikupi_sve_podatke(putanja_X=KES_X, putanja_y=KES_Y)
        treniraj_i_sacuvaj(svi_X, svi_y, MODEL)
    else:
        print(f"Model vec postoji ({MODEL}). Obrisi ga ako hoces da treniras iznova.")
    print("\n=== PREDIKCIJA ===")
    nova_pesma = input("Unesi putanju do audio fajla za predikciju: ").strip()
    predvidi_akorde(nova_pesma, MODEL)