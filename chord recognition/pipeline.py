import os
import json
import torch
import subprocess
from vocal_remover import create_instrumental
from chord_predictor import predict
from formatter import format
from faster_whisper import WhisperModel


def _download_audio(youtube_link: str, folder: str):
    out_path = os.path.join(folder, "audio.mp3")

    meta_results = subprocess.run([
        "yt-dlp",
        "--dump-json",
        "--no-playlist",
        youtube_link
    ], check=True, capture_output=True, text=True)

    meta = json.loads(meta_results.stdout)
    title = meta.get("title", "Unknown")

    subprocess.run([
        "yt-dlp",
        "--js-runtimes", "node:C:\\Program Files\\nodejs\\node.exe",
        "--no-playlist",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "-o", out_path,
        youtube_link
    ], check=True)

    return out_path, title


def _transcribe_with_times(audio_path: str) -> list[dict]:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"

    model = WhisperModel("medium", device=device, compute_type=compute_type)
    segmenti, _ = model.transcribe(
        audio_path,
        language="sr",
        vad_filter=True,
        temperature=0.0,
        no_speech_threshold=0.6,
        word_timestamps=True,
        initial_prompt="latinica: ja, ti, on, mi, vi, oni",
    )

    words = []
    for segment in segmenti:
        if segment.words:
            for word in segment.words:
                words.append({
                    "word": word.word.strip(),
                    "start": word.start,
                    "end": word.end,
                })

    return words


def start_pipeline(youtube_link: str, work_dir: str = None):
    audio_path, title = _download_audio(youtube_link, work_dir)

    create_instrumental(audio_path, work_dir)

    name = os.path.splitext(os.path.basename(audio_path))[0]
    demucs_folder = os.path.join(work_dir, "htdemucs", name)

    vocals_path = os.path.join(demucs_folder, "vocals.wav")
    no_vocals_path = os.path.join(demucs_folder, "no_vocals.wav")

    words = _transcribe_with_times(vocals_path)
    chords = predict(no_vocals_path)

    result = format(words, chords)

    return result, title
