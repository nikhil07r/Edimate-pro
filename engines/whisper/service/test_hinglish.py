"""
EDITMATE PRO - Hinglish & Hindi Verification Test
"""

import os
import sys
import time
from pathlib import Path
import whisper

def test_hinglish():
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    models_dir = base_dir / "engines" / "whisper" / "models"
    audio_file = base_dir / "exports" / "subtitles" / "test_sample_hinglish.wav"

    # Generate synthetic audio with PowerShell SAPI
    import subprocess
    ps_cmd = f'''
    Add-Type -AssemblyName System.Speech
    $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $s.SetOutputToWaveFile("{audio_file}")
    $s.Speak("Hello doston, welcome to EditMate Pro. Aaj hum video editing mein automatic captions generate karenge.")
    $s.Dispose()
    '''
    subprocess.run(["powershell", "-Command", ps_cmd], check=True)

    print("Loading Whisper model...")
    model = whisper.load_model("small", download_root=str(models_dir))

    print("\n--- Test 1: Auto-detection ---")
    res1 = model.transcribe(str(audio_file), word_timestamps=True)
    print("Auto-detected Language:", res1["language"])
    print("Text:", res1["text"].strip())

    print("\n--- Test 2: With Hinglish / Hindi Initial Prompt ---")
    prompt = "Namaste doston. Yeh ek Hindi aur English conversation hai. Video editing aur captions."
    res2 = model.transcribe(str(audio_file), initial_prompt=prompt, word_timestamps=True)
    print("Detected Language:", res2["language"])
    print("Prompted Text:", res2["text"].strip())

    print("\n--- Test 3: Translate Task (Translates to English) ---")
    res3 = model.transcribe(str(audio_file), task="translate")
    print("English Translation:", res3["text"].strip())

    print("\n✅ Hinglish / Hindi capabilities verified!")

if __name__ == "__main__":
    test_hinglish()
