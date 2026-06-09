import os
import json
import torch
import subprocess
from vocal_remover import create_instrumental
from chord_predictor import predvidi
from formatter import formatiraj_izlaz
from faster_whisper import WhisperModel

def _preuzmi_audio(youtube_link: str, folder: str):
    cilj = os.path.join(folder, "audio.mp3")

    meta_rezultat = subprocess.run([
        "yt-dlp",
        "--dump-json",
        "--no-playlist",
        youtube_link
    ], check=True, capture_output=True, text=True)

    meta = json.loads(meta_rezultat.stdout)
    naslov = meta.get("title", "Nepoznato")

    subprocess.run([
        "yt-dlp",
        "--js-runtimes", "node:C:\\Program Files\\nodejs\\node.exe",
        "--no-playlist",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "-o", cilj,
        youtube_link
    ], check=True)

    return cilj, naslov

def _transkribuj_sa_vremenima(putanja_audio: str) -> list[dict]:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"

    model = WhisperModel("medium", device=device, compute_type=compute_type)
    segmenti, _ = model.transcribe(
        putanja_audio,
        language="sr",
        vad_filter=True,
        temperature=0.0,
        no_speech_threshold=0.6,
        word_timestamps=True,
        initial_prompt="latinica: ja, ti, on, mi, vi, oni",
    )

    reci = []
    for segment in segmenti:
        if segment.words:
            for rec in segment.words:
                reci.append({
                    "word": rec.word.strip(),
                    "start": rec.start,
                    "end": rec.end,
                })

    return reci

def pokreni_pipeline(youtube_link: str, radni_folder: str = None):
    putanja_audio, naslov = _preuzmi_audio(youtube_link, radni_folder)

    create_instrumental(putanja_audio, radni_folder)

    naziv = os.path.splitext(os.path.basename(putanja_audio))[0]
    demucs_folder = os.path.join(radni_folder, "htdemucs", naziv)

    vokali_putanja = os.path.join(demucs_folder, "vocals.wav")
    instrumental_putanja = os.path.join(demucs_folder, "no_vocals.wav")

    reci = _transkribuj_sa_vremenima(vokali_putanja)
    akordi = predvidi(instrumental_putanja)

    rezultat = formatiraj_izlaz(reci, akordi, naslov)

    return rezultat, naslov
