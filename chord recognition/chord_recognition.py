import os
import glob
import json
import bisect
import librosa
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import re
import torch.nn.functional as F
from scipy.stats import mode as scipy_mode
from tqdm import tqdm
import time

from constants import (
    HOP_LENGTH, TARGET_SR, EPOCHS, BATCH_SIZE, LEARNING_RATE,
    CONTEXT_BEFORE, CONTEXT_AFTER, CONTEXT_TOTAL, N_FEATURES,
    PITCHES, IDX_TO_LABEL, LABEL_TO_IDX, N_CLASSES,
    ENHARMONIC, ROOT_RE,
)
from models import FrameDataset, ChordCNN, ChordMLP


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


def transpose_labels(labels, n_steps):
    N_IDX = LABEL_TO_IDX["N"]
    result = labels.copy()
    mask = labels != N_IDX
    chords = labels[mask]
    group = chords // 12
    tone = chords % 12
    new_tone = (tone + n_steps) % 12
    result[mask] = group * 12 + new_tone
    return result


def load_audio(path, sr=TARGET_SR):
    y, sr_out = librosa.load(path, sr=sr, mono=True)
    if np.max(np.abs(y)) > 0:
        y = y / np.max(np.abs(y))
    return y, sr_out


def audio_to_chromagram(y, sr):
    C_cqt = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=HOP_LENGTH, n_chroma=12)
    C_cqt = librosa.power_to_db(C_cqt, ref=np.max)

    C_cens = librosa.feature.chroma_cens(y=y, sr=sr, hop_length=HOP_LENGTH, n_chroma=12)

    C_cqt_norm = librosa.util.normalize(C_cqt, norm=2, axis=0)
    C_cens_norm = librosa.util.normalize(C_cens, norm=2, axis=0)

    C_combined = (C_cqt_norm + C_cens_norm) / 2.0
    C_final = librosa.util.normalize(C_combined, norm=2, axis=0)

    return C_final.astype(np.float32)


def make_windows(C_T):
    T = C_T.shape[0]
    padded = np.zeros((CONTEXT_BEFORE + T + CONTEXT_AFTER, 12), dtype=np.float32)
    padded[CONTEXT_BEFORE:CONTEXT_BEFORE + T] = C_T
    windows = np.stack([
        padded[i:i + CONTEXT_TOTAL].reshape(-1)
        for i in range(T)
    ], axis=0)
    return windows


def load_labels_from_jams(jams_path, times):
    with open(jams_path, "r", encoding="utf-8") as f:
        content = json.load(f)
    chord_annotations = [a for a in content["annotations"] if a.get("namespace") == "chord"]
    if not chord_annotations:
        return np.full(len(times), LABEL_TO_IDX["N"], dtype=np.int64)
    starts, ends, raw_labels = [], [], []
    for obs in chord_annotations[0]["data"]:
        start = float(obs["time"])
        starts.append(start)
        ends.append(start + float(obs["duration"]))
        raw_labels.append(str(obs["value"]))
    if starts:
        sort_idx = np.argsort(starts)
        starts = [starts[i] for i in sort_idx]
        ends = [ends[i] for i in sort_idx]
        raw_labels = [raw_labels[i] for i in sort_idx]
    labels = []
    for t in times:
        idx = bisect.bisect_right(starts, t) - 1
        label = "N"
        if idx >= 0 and starts[idx] <= t < ends[idx]:
            label = raw_labels[idx]
        labels.append(chord_label_to_id(label))
    return np.array(labels, dtype=np.int64)


def _count_frames(valid_list):
    total = 0
    for wav_path, jams_path, _ in valid_list:
        y, sr = load_audio(wav_path)
        C = audio_to_chromagram(y, sr)
        total += C.shape[1] * 7
    return total


def collect_all_data(audio_folder="audio_mono-mic", jams_folder="annotation",
                     path_X_train="X_train.npy", path_y_train="y_train.npy",
                     path_X_val="X_val.npy", path_y_val="y_val.npy"):
    wav_files = sorted(glob.glob(os.path.join(audio_folder, "*.wav")))

    valid = []
    for wav_path in wav_files:
        name_with_suffix = os.path.splitext(os.path.basename(wav_path))[0]
        name_without_suffix = name_with_suffix.replace("_mic", "")
        jams_path = os.path.join(jams_folder, name_without_suffix + ".jams")
        if os.path.exists(jams_path):
            valid.append((wav_path, jams_path, name_with_suffix))

    split_idx = int(len(valid) * 0.85)
    valid_train = valid[:split_idx]
    valid_val = valid[split_idx:]

    print(f"Total songs: {len(valid)} -> Train: {len(valid_train)}, Validation: {len(valid_val)}")

    print("Counting frames for Train set...")
    frames_train = _count_frames(valid_train)
    print("Counting frames for Validation set...")
    frames_val = _count_frames(valid_val)

    X_train_mm = np.lib.format.open_memmap(path_X_train, mode="w+", dtype=np.float32, shape=(frames_train, N_FEATURES))
    y_train_mm = np.lib.format.open_memmap(path_y_train, mode="w+", dtype=np.int64,   shape=(frames_train,))

    X_val_mm = np.lib.format.open_memmap(path_X_val, mode="w+", dtype=np.float32, shape=(frames_val, N_FEATURES))
    y_val_mm = np.lib.format.open_memmap(path_y_val, mode="w+", dtype=np.int64,   shape=(frames_val,))

    offset = 0
    pbar = tqdm(valid_train, desc="Writing Train      ", unit="song", dynamic_ncols=True)
    for wav_path, jams_path, name in pbar:
        try:
            y_audio, sr = load_audio(wav_path)
            C = audio_to_chromagram(y_audio, sr)
            times = np.arange(C.shape[1]) * HOP_LENGTH / sr
            labels = load_labels_from_jams(jams_path, times)
            T = C.shape[1]
            for step in range(-3, 4):
                C_aug = np.roll(C.T, shift=step, axis=1)
                X_aug = make_windows(C_aug)
                y_aug = transpose_labels(labels, step)
                X_train_mm[offset:offset + T] = X_aug
                y_train_mm[offset:offset + T] = y_aug
                offset += T
        except Exception as e:
            tqdm.write(f"  ERROR TRAIN ({name}): {e}")

    offset = 0
    pbar = tqdm(valid_val, desc="Writing Validation ", unit="song", dynamic_ncols=True)
    for wav_path, jams_path, name in pbar:
        try:
            y_audio, sr = load_audio(wav_path)
            C = audio_to_chromagram(y_audio, sr)
            times = np.arange(C.shape[1]) * HOP_LENGTH / sr
            labels = load_labels_from_jams(jams_path, times)
            T = C.shape[1]
            for step in range(-3, 4):
                C_aug = np.roll(C.T, shift=step, axis=1)
                X_aug = make_windows(C_aug)
                y_aug = transpose_labels(labels, step)
                X_val_mm[offset:offset + T] = X_aug
                y_val_mm[offset:offset + T] = y_aug
                offset += T
        except Exception as e:
            tqdm.write(f"  ERROR VAL ({name}): {e}")

    X_train_mm.flush()
    y_train_mm.flush()
    X_val_mm.flush()
    y_val_mm.flush()

    return X_train_mm, y_train_mm, X_val_mm, y_val_mm


def load_cache(p_Xt="X_train.npy", p_yt="y_train.npy", p_Xv="X_val.npy", p_yv="y_val.npy"):
    return (np.lib.format.open_memmap(p_Xt, mode="r"),
            np.lib.format.open_memmap(p_yt, mode="r"),
            np.lib.format.open_memmap(p_Xv, mode="r"),
            np.lib.format.open_memmap(p_yv, mode="r"))


def shuffle_memmap(X_path, y_path, X_out, y_out, chunk_size=50_000):
    X = np.lib.format.open_memmap(X_path, mode="r")
    y = np.lib.format.open_memmap(y_path, mode="r")
    N = len(y)

    idx = np.random.permutation(N)

    X_new = np.lib.format.open_memmap(X_out, mode="w+", dtype=X.dtype, shape=X.shape)
    y_new = np.lib.format.open_memmap(y_out, mode="w+", dtype=y.dtype, shape=y.shape)

    pbar = tqdm(range(0, N, chunk_size), desc="Shuffling", unit="chunk", dynamic_ncols=True)
    write_pos = 0
    for start in pbar:
        batch_idx = np.sort(idx[start:start + chunk_size])
        size = len(batch_idx)
        X_new[write_pos:write_pos + size] = X[batch_idx]
        y_new[write_pos:write_pos + size] = y[batch_idx]
        write_pos += size

    X_new.flush()
    y_new.flush()
    print(f"Shuffled memmap saved to {X_out} and {y_out}")


def train_and_save(X_train, y_train, X_val, y_val, model_path="models/MLP_model.pt", model_type="MLP"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    counts = np.bincount(np.array(y_train, dtype=np.int64), minlength=N_CLASSES).astype(np.float64)
    weights = 1.0 / np.sqrt(counts + 1.0)
    weights = weights / weights.mean()

    train_dataset = FrameDataset(X_train, y_train, model_type=model_type)
    val_dataset = FrameDataset(X_val, y_val, model_type=model_type)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=False)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=False)

    if model_type.upper() == "CNN":
        model = ChordCNN(n_classes=N_CLASSES).to(device)
    else:
        model = ChordMLP(n_classes=N_CLASSES).to(device)

    criterion = nn.CrossEntropyLoss(weight=torch.tensor(weights, dtype=torch.float32).to(device))
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=5, factor=0.5)

    best_val_loss = float("inf")
    patience = 10
    no_improve_count = 0

    start_time = time.time()
    epoch_pbar = tqdm(range(1, EPOCHS + 1), desc="Training", unit="epoch", dynamic_ncols=True)

    for epoch in epoch_pbar:
        model.train()
        total_loss, correct, total = 0.0, 0, 0
        batch_pbar = tqdm(train_loader, desc=f"  Epoch {epoch:>3}/{EPOCHS} [Train]", unit="batch", leave=False, dynamic_ncols=True)

        for Xb, yb in batch_pbar:
            Xb, yb = Xb.to(device), yb.to(device)
            optimizer.zero_grad()
            output = model(Xb)
            loss = criterion(output, yb)
            loss.backward()
            optimizer.step()

            predictions = output.argmax(dim=1)
            correct += (predictions == yb).sum().item()
            total += yb.size(0)
            total_loss += loss.item() * yb.size(0)

            batch_pbar.set_postfix({
                "loss": f"{total_loss/total:.4f}",
                "acc": f"{correct/total*100:.1f}%"
            })

        train_loss = total_loss / total
        train_acc = (correct / total) * 100

        model.eval()
        val_loss, val_correct, val_total = 0.0, 0, 0
        with torch.no_grad():
            for Xb, yb in val_loader:
                Xb, yb = Xb.to(device), yb.to(device)
                output = model(Xb)
                loss = criterion(output, yb)

                predictions = output.argmax(dim=1)
                val_correct += (predictions == yb).sum().item()
                val_total += yb.size(0)
                val_loss += loss.item() * yb.size(0)

        validation_loss = val_loss / val_total
        validation_acc = (val_correct / val_total) * 100

        scheduler.step(validation_loss)
        elapsed = time.time() - start_time
        remaining = elapsed / epoch * (EPOCHS - epoch)
        h, m = divmod(int(remaining), 3600)
        m, s = divmod(m, 60)

        epoch_pbar.set_postfix({
            "t_loss": f"{train_loss:.3f}",
            "t_acc": f"{train_acc:.1f}%",
            "v_loss": f"{validation_loss:.3f}",
            "v_acc": f"{validation_acc:.1f}%",
            "remaining": f"{h:02d}:{m:02d}:{s:02d}"
        })

        if validation_loss < best_val_loss:
            best_val_loss = validation_loss
            no_improve_count = 0
            torch.save(model.state_dict(), model_path)
        else:
            no_improve_count += 1
            if no_improve_count >= patience:
                print(f"\n[Early Stopping] Training stopped at epoch {epoch} — validation loss did not improve for {patience} epochs.")
                break

    print(f"\nBest model saved to: {model_path}")


def are_related_chords(name1, name2):
    if name1 == "N" or name2 == "N" or name1 == name2:
        return False
    root1 = name1[:-1] if name1.endswith("m") else name1
    qual1 = "min" if name1.endswith("m") else "maj"
    root2 = name2[:-1] if name2.endswith("m") else name2
    qual2 = "min" if name2.endswith("m") else "maj"
    if root1 not in PITCHES or root2 not in PITCHES:
        return False
    idx1 = PITCHES.index(root1)
    idx2 = PITCHES.index(root2)
    distance = (idx2 - idx1) % 12
    if root1 == root2 and qual1 != qual2:
        return True
    if qual1 == "maj" and qual2 == "min" and distance == 9:
        return True
    if qual1 == "min" and qual2 == "maj" and distance == 3:
        return True
    if qual1 == qual2 and distance in (5, 7):
        return True
    return False


def predict_chords(audio_path, model_path="models/MLP_model.pt", model_type="MLP"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    if model_type.upper() == "CNN":
        model = ChordCNN(n_classes=N_CLASSES).to(device)
    else:
        model = ChordMLP(n_classes=N_CLASSES).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    y, sr = load_audio(audio_path)
    C = audio_to_chromagram(y, sr)
    times = np.arange(C.shape[1]) * HOP_LENGTH / sr
    X = make_windows(C.T)
    tensor_X = torch.from_numpy(X).to(device)
    if model_type.upper() == "CNN":
        tensor_X = tensor_X.view(-1, 1, CONTEXT_TOTAL, 12)
    with torch.no_grad():
        outputs = model(tensor_X)
        probs = F.softmax(outputs, dim=1).cpu().numpy()

    STAY_PROB = 0.992
    TRANS_MAT = np.zeros((N_CLASSES, N_CLASSES))
    for i in range(N_CLASSES):
        for j in range(N_CLASSES):
            if i == j:
                TRANS_MAT[i, j] = STAY_PROB
            else:
                src_name = IDX_TO_LABEL[i]
                dst_name = IDX_TO_LABEL[j]
                
                if src_name == "N" or dst_name == "N":
                    TRANS_MAT[i, j] = 0.005 / (N_CLASSES - 1)
                    continue
                
                src_root = src_name[:-1] if src_name.endswith("m") else src_name
                dst_root = dst_name[:-1] if dst_name.endswith("m") else dst_name
                
                if src_root in PITCHES and dst_root in PITCHES:
                    idx1 = PITCHES.index(src_root)
                    idx2 = PITCHES.index(dst_root)
                    
                    distance = min(abs(idx1 - idx2), 12 - abs(idx1 - idx2))
                    
                    if distance == 1:
                        TRANS_MAT[i, j] = 1e-8
                        continue

                if are_related_chords(src_name, dst_name):
                    TRANS_MAT[i, j] = 0.006
                else:
                    TRANS_MAT[i, j] = 0.0001
                    
    TRANS_MAT = TRANS_MAT / TRANS_MAT.sum(axis=1, keepdims=True)

    prediction_ids = librosa.sequence.viterbi_discriminative(probs.T, TRANS_MAT)

    T = len(prediction_ids)
    WINDOW = 86
    pad = WINDOW // 2
    padded_pred = np.pad(prediction_ids, (pad, pad), mode="edge")
    smoothed = np.array([
        scipy_mode(padded_pred[i:i + WINDOW], keepdims=True).mode[0]
        for i in range(T)
    ], dtype=np.int64)

    CONFIDENCE_THRESHOLD = 0.4
    filtered_ids = []
    current = smoothed[0]
    for i, idx in enumerate(smoothed):
        if idx != current and probs[i, idx] > CONFIDENCE_THRESHOLD:
            current = idx
        filtered_ids.append(current)
    smoothed = np.array(filtered_ids)

    print("\nPredicted chords over time:")
    print("-" * 50)
    result = []
    previous = None
    for i, idx in enumerate(smoothed):
        chord = IDX_TO_LABEL[idx]
        if chord != previous:
            result.append({
                "time": float(times[i]),
                "chord": chord,
                "confidence": float(probs[i, idx]),
            })
            print(f"  {times[i]:6.2f}s  ->  {chord:<6}  (confidence: {probs[i, idx]:.2f})")
            previous = chord
    return result


if __name__ == "__main__":
    MODEL = "models/CNN_model.pt"
    SELECTED_MODEL = "CNN"

    CACHE_X_TRAIN, CACHE_Y_TRAIN = r"D:\chord_kes\X_train.npy", r"D:\chord_kes\y_train.npy"
    CACHE_X_VAL, CACHE_Y_VAL = r"D:\chord_kes\X_val.npy", r"D:\chord_kes\y_val.npy"

    SHUFFLED_X_TRAIN = r"D:\chord_kes\X_train_shuffled.npy"
    SHUFFLED_Y_TRAIN = r"D:\chord_kes\y_train_shuffled.npy"

    if not os.path.exists(MODEL):
        if (os.path.exists(CACHE_X_TRAIN) and os.path.exists(CACHE_Y_TRAIN) and
            os.path.exists(CACHE_X_VAL) and os.path.exists(CACHE_Y_VAL)):

            if not os.path.exists(SHUFFLED_X_TRAIN) or not os.path.exists(SHUFFLED_Y_TRAIN):
                print("Shuffling train data (one-time operation)...")
                shuffle_memmap(CACHE_X_TRAIN, CACHE_Y_TRAIN, SHUFFLED_X_TRAIN, SHUFFLED_Y_TRAIN)

            print("Loading cached data from disk (memmap)...")
            X_tr, y_tr, X_va, y_va = load_cache(SHUFFLED_X_TRAIN, SHUFFLED_Y_TRAIN, CACHE_X_VAL, CACHE_Y_VAL)
        else:
            print("Generating new cache with log scaling and Train/Val split...")
            X_tr, y_tr, X_va, y_va = collect_all_data(
                path_X_train=CACHE_X_TRAIN, path_y_train=CACHE_Y_TRAIN,
                path_X_val=CACHE_X_VAL, path_y_val=CACHE_Y_VAL
            )
            print("Shuffling train data (one-time operation)...")
            shuffle_memmap(CACHE_X_TRAIN, CACHE_Y_TRAIN, SHUFFLED_X_TRAIN, SHUFFLED_Y_TRAIN)
            X_tr = np.lib.format.open_memmap(SHUFFLED_X_TRAIN, mode="r")
            y_tr = np.lib.format.open_memmap(SHUFFLED_Y_TRAIN, mode="r")

        train_and_save(X_tr, y_tr, X_va, y_va, MODEL, SELECTED_MODEL)
    else:
        print(f"Model already exists ({MODEL}). Delete it if you want to retrain.")

    print("\n=== PREDICTION ===")
    new_song = input("Enter path to audio file for prediction: ").strip()
    predict_chords(new_song, MODEL, SELECTED_MODEL)