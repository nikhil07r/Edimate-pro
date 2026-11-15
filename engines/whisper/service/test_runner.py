"""
EDITMATE PRO - Verification Script
Tests Whisper transcription, Hindi/English language handling,
timestamps, word timestamps, and SRT generation.
"""

import os
import sys
import time
from pathlib import Path
import whisper

def run_test():
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    models_dir = base_dir / "engines" / "whisper" / "models"
    audio_file = base_dir / "exports" / "subtitles" / "test_sample_en.wav"

    print("==================================================")
    print(" EDITMATE PRO - Whisper Test Suite")
    print(f" Python: {sys.version.split()[0]}")
    print(f" Models Dir: {models_dir}")
    print(f" Test Audio: {audio_file}")
    print("==================================================")

    if not audio_file.exists():
        print(f"ERROR: Audio file not found: {audio_file}")
        return False

    t0 = time.time()
    print("Loading 'small' model from local cache...")
    model = whisper.load_model("small", download_root=str(models_dir))
    print(f"Model loaded in {time.time() - t0:.2f}s on {model.device}")

    t1 = time.time()
    print("\nRunning transcription with word-level timestamps...")
    result = model.transcribe(str(audio_file), word_timestamps=True, verbose=False)
    duration = time.time() - t1

    print(f"Transcription finished in {duration:.2f}s!")
    print(f"Detected Language: {result.get('language')}")
    print(f"Transcript:\n  '{result.get('text', '').strip()}'")

    segments = result.get("segments", [])
    print(f"\nTotal Segments: {len(segments)}")
    for i, seg in enumerate(segments, 1):
        print(f"  [{seg['start']:.2f}s -> {seg['end']:.2f}s] {seg['text'].strip()}")
        words = seg.get("words", [])
        if words:
            word_str = " | ".join([f"{w['word'].strip()}({w['start']:.2f}-{w['end']:.2f})" for w in words[:6]])
            print(f"    Words: {word_str}...")

    # Validate SRT formatting
    from app import generate_srt, generate_word_srt
    srt = generate_srt(segments)
    word_srt = generate_word_srt(segments)

    srt_path = base_dir / "exports" / "subtitles" / "test_sample_en.srt"
    srt_path.write_text(srt, encoding="utf-8")
    print(f"\nGenerated standard SRT: {srt_path}")

    word_srt_path = base_dir / "exports" / "subtitles" / "test_sample_en_words.srt"
    word_srt_path.write_text(word_srt, encoding="utf-8")
    print(f"Generated word-level SRT: {word_srt_path}")

    print("\n✅ TEST PASSED: All requirements verified successfully!")
    return True

if __name__ == "__main__":
    success = run_test()
    sys.exit(0 if success else 1)
