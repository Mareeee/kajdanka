import os
import subprocess


def convert_mp3_to_wav(mp3_path):
    wav_path = os.path.splitext(mp3_path)[0] + "_temp.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-i", mp3_path, wav_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
    )
    return wav_path


def create_instrumental(audio_path, output_dir):
    subprocess.run(
        ["demucs", "--two-stems=vocals", "-o", output_dir, audio_path],
        check=True
    )
