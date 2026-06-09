import os
from faster_whisper import WhisperModel

def transcribe_serbian_song(audio_path, output_script="latin"):
    model_size = "medium" 
    
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    segments, info = model.transcribe(
        audio_path, 
        language="sr", 
        vad_filter=False,
        temperature=0.0,
        no_speech_threshold=0.6
    )    
    
    full_text = []
    for segment in segments:
        print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
        full_text.append(segment.text)
        
    lyrics = "\n".join(full_text)
    return lyrics

if __name__ == "__main__":
    song_path = r"C:\Users\Marko\OneDrive\Desktop\diplomski\kajdanka\chord recognition\nijemenedusoubilo.mp3"
    
    lyrics_latin = transcribe_serbian_song(song_path, output_script="latin")
    
    base_path, _ = os.path.splitext(song_path)
    output_txt_path = f"{base_path}_transkript.txt"
    
    with open(output_txt_path, "w", encoding="utf-8") as f:
        f.write(lyrics_latin)
        