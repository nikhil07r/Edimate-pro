# EDITMATE PRO — Premiere Pro 2026 Toolbox

**Professional AI-Powered Editing Assistant for Adobe Premiere Pro 2026**

EDITMATE PRO combines a high-performance dockable UXP panel with a 100% offline, local OpenAI Whisper AI transcription engine.

---

## 🌟 Features Implemented in this Release

* 🧠 **Offline OpenAI Whisper AI Engine:**
  * Runs entirely on your 14-core Intel Core i9 processor (zero cloud fees, zero data transmission).
  * Multilingual `small` model (~461MB) downloaded and cached in `engines/whisper/models/`.
  * Multi-format audio support: WAV, MP3, M4A, AAC, FLAC, MP4, MOV via local FFmpeg 9.0.
  * English, Hindi (हिन्दी), and Hinglish transcription with prompt adaptation.
  * Sub-second word-level timestamps (`word_timestamps=True`).
  * Automatic generation of `.srt`, `.vtt`, `.txt`, `.json`, and animated word-level `.srt` files.
* 💬 **AI Captions Studio (UXP Panel):**
  * Auto-detect media source path from timeline clips with 1 click.
  * Interactive in-panel transcript editor (edit segment text, inspect word timings).
  * Live progress percentage indicator with cancellation support.
  * 4 Caption Style Presets: Cyber Cyan, Viral Yellow, Clean Minimalist, Hormozi Pop.
  * 1-Click **Import to Premiere Project** (brings subtitle asset straight into Project bin).
* 🎛️ **Modern Dockable UXP Interface:**
  * Dark theme matching `#07111F` with `#00D9FF` cyber cyan accents.
  * 12 sidebar categories: Home, Cutting, Captions, B-Roll, Audio, Motion, Multicam, Effects, Macros, Export, Media, Settings.
  * Live status indicator showing Whisper AI engine connectivity.

---

## 📁 Project Directory Structure

```
EDITMATE-PRO/
├── start_whisper_service.bat      # 1-Click start script for Whisper service (Port 5588)
├── stop_whisper_service.bat       # 1-Click stop script
├── engines/
│   └── whisper/
│       ├── venv/                 # Python 3.12 virtual environment (torch CPU + whisper)
│       ├── models/               # Cached model weights (small.pt)
│       ├── service/              # REST API service (app.py) & test scripts
│       └── logs/                 # Local execution logs
├── extensions/
│   └── premiere-uxp/             # UXP Plugin Panel bundle
├── exports/
│   └── subtitles/                # Exported SRT, VTT, TXT, JSON, word-level SRT files
└── documentation/
    ├── README.md
    ├── WHISPER_SETUP.md          # Full setup and troubleshooting documentation
    └── FEATURE_STATUS.md         # Comprehensive feature roadmap & status tracker
```

---

## 🚀 Quick Start Guide

### 1. Start the Whisper Service
Double click:
```
start_whisper_service.bat
```
*(Runs on `http://127.0.0.1:5588`)*

### 2. Load into Adobe Premiere Pro 2026
1. In Premiere Pro: **Edit → Preferences → Plugins** → Ensure **Enable Developer Mode** is checked.
2. Open **Adobe UXP Developer Tool (UDT)**.
3. Click **Add Plugin** and select:
   `manifest.json` (or `extensions/premiere-uxp/manifest.json`).
4. Click **Load**.
5. In Premiere Pro, open **Window → EDITMATE PRO**.

### 3. Generate Captions
1. Open the **Captions** tab.
2. Select or auto-detect your audio file (`🎯 Timeline Clip` or paste file path).
3. Choose Language (Auto, English, or Hinglish) and Model (`Small`).
4. Click **⚡ Generate Captions**.
5. When complete, click **📥 Import to Premiere Project** and drag the subtitle onto your timeline!

---

## 🔒 Safety & Privacy

- **Offline Only:** All transcription runs locally on your laptop.
- **Non-destructive:** Original media and project files are never modified.
- **Repeatable:** Dedicated virtual environment prevents system package conflicts.
