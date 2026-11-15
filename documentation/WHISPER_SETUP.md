# EDITMATE PRO – Local OpenAI Whisper Setup Guide

This guide explains the local, 100% offline installation of OpenAI Whisper for EDITMATE PRO in Adobe Premiere Pro 2026.

---

## 1. System Specifications & Configuration

* **OS:** Windows 11 (64-bit)
* **CPU:** 13th Gen Intel Core i9-13900H (14 cores, 20 logical threads)
* **RAM:** 32 GB
* **Audio Processing:** CPU-optimized PyTorch execution
* **FFmpeg:** Version 9.0.2 (system PATH verified)
* **Python:** Python 3.12.10 (isolated venv)

---

## 2. Directory Structure

```
EDITMATE-PRO/
├── start_whisper_service.bat      # 1-Click launcher for Whisper REST API
├── stop_whisper_service.bat       # 1-Click service stopper
├── engines/
│   └── whisper/
│       ├── venv/                 # Isolated Python 3.12 environment with torch & whisper
│       ├── models/               # Dedicated local cache for models (*.pt)
│       │   └── small.pt          # Multilingual Small model (~461MB, verified)
│       ├── service/
│       │   ├── app.py            # Local Flask REST API (127.0.0.1:5588)
│       │   ├── run_service.bat   # Direct launcher script
│       │   ├── test_runner.py    # Automated test suite (English + timestamps)
│       │   └── test_hinglish.py  # Hindi / Hinglish verification script
│       └── logs/
│           └── whisper_service.log
├── extensions/
│   └── premiere-uxp/             # UXP Panel (manifest.json, index.html, css, js, icons)
├── exports/
│   └── subtitles/                # Auto-generated SRT, VTT, TXT, JSON, and word-level SRTs
└── documentation/
    ├── README.md
    ├── WHISPER_SETUP.md          # (This file)
    └── FEATURE_STATUS.md
```

---

## 3. How to Start and Stop the Service

### To Start the Service:
Double-click:
`start_whisper_service.bat` (at the root of EDITMATE-PRO)
Or run from PowerShell/CMD:
```powershell
C:\Users\nikhil\.gemini\antigravity\scratch\EDITMATE-PRO\start_whisper_service.bat
```
The console will display:
```
==================================================
 EDITMATE PRO - Whisper AI Service starting on port 5588
 Models directory: ...\engines\whisper\models
 Exports directory: ...\exports\subtitles
==================================================
Running on http://127.0.0.1:5588
```

### To Stop the Service:
Double-click:
`stop_whisper_service.bat`
Or press `Ctrl+C` in the service console window.

---

## 4. API Endpoints Reference

The service runs locally at `http://127.0.0.1:5588`:

| Endpoint | Method | Description |
|---|---|---|
| `/health` or `/status` | `GET` | Service status, cached models, active job state |
| `/models` | `GET` | List available Whisper models and their descriptions |
| `/transcribe` | `POST` | Transcribe audio (`audio_path`, `model`, `language`, `word_timestamps`) |
| `/progress` | `GET` | Poll live progress percentage and status message |
| `/cancel` | `POST` | Cancel active transcription job |
| `/export_srt` | `POST` | Save user-edited segments to a new `.srt` file |

---

## 5. Supported Audio Formats & Languages

* **Formats:** `.wav`, `.mp3`, `.m4a`, `.aac`, `.flac`, `.ogg`, `.mp4`, `.mov`, `.mkv` (via system FFmpeg)
* **Languages:**
  * **Auto Detect:** Automatic language identification
  * **English:** High-accuracy transcription with punctuation
  * **Hindi (हिन्दी):** Full Devanagari script generation
  * **Hinglish:** Assisted prompt mode to transcribe mixed Hindi and English
  * **Translate Task:** Translates any spoken language directly into English subtitles

---

## 6. How to Use Inside Adobe Premiere Pro 2026

1. **Start Whisper Service:** Double-click `start_whisper_service.bat`.
2. **Open Premiere Pro 2026:** Ensure Developer Mode is enabled under *Edit → Preferences → Plugins*.
3. **Load UXP Panel:**
   * Open *Adobe UXP Developer Tool (UDT)*.
   * Add Plugin: browse to `EDITMATE-PRO\manifest.json` (or `extensions\premiere-uxp\manifest.json`).
   * Click **Load**.
4. **Open Panel in Premiere:** Go to **Window → EDITMATE PRO**.
5. **Generate Captions:**
   * Click on the **Captions** tab in the sidebar.
   * Click **🎯 Timeline Clip** to auto-detect media from the active sequence, or paste/browse an audio path.
   * Select your model (e.g. `Small`) and Language (e.g. `Auto Detect`, `English`, or `Hinglish`).
   * Click **⚡ Generate Captions**.
6. **Review & Edit:**
   * Watch the real-time progress bar.
   * Review generated segments in the built-in interactive editor.
   * Edit any text directly in place.
7. **Place on Timeline:**
   * Click **📥 Import to Premiere Project**.
   * The `.srt` file appears instantly in your Project bin.
   * Drag the subtitle item from the Project bin onto your sequence timeline. Premiere Pro 2026 automatically generates a native **Subtitle Track**!
8. **Style Captions:**
   * Open Premiere's **Text** or **Essential Graphics** workspace.
   * Customize font, size, fill, and positioning using the EDITMATE PRO Style Presets.

---

## 7. Safety & Privacy Guarantees

* **Zero Cloud Uploads:** Audio never leaves your computer; all inference runs on your 14-core Intel i9 CPU.
* **Non-destructive:** Original media files are never overwritten.
* **Dedicated Local Models:** Model weights (`small.pt`, 461MB) are cached in `engines/whisper/models`.
