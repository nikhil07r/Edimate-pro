"""
EDITMATE PRO - Whisper AI Transcription Service
Local REST API for Adobe Premiere Pro integration.
Runs completely offline on 127.0.0.1.
"""

import os
import sys
import json
import time
import math
import logging
import threading
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# Configure logging
LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
log_file = LOG_DIR / "whisper_service.log"

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("EditMateWhisper")

app = Flask(__name__)
CORS(app)  # Allow requests from Premiere UXP panel

# Model cache & paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODELS_DIR = BASE_DIR / "engines" / "whisper" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_EXPORTS_DIR = BASE_DIR / "exports" / "subtitles"
DEFAULT_EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

loaded_models = {}
model_lock = threading.Lock()
active_job = {
    "status": "idle",
    "progress": 0,
    "message": "",
    "error": None,
    "should_cancel": False,
    "result": None
}

def format_timestamp(seconds: float, srt: bool = True) -> str:
    """Format seconds into SRT or VTT timestamp."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    if millis >= 1000:
        millis = 999
    sep = "," if srt else "."
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{sep}{millis:03d}"

def generate_srt(segments: list) -> str:
    """Generate standard SRT subtitle string."""
    lines = []
    for i, seg in enumerate(segments, start=1):
        start = format_timestamp(seg["start"], srt=True)
        end = format_timestamp(seg["end"], srt=True)
        text = seg["text"].strip()
        lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(lines)

def generate_vtt(segments: list) -> str:
    """Generate WebVTT subtitle string."""
    lines = ["WEBVTT\n"]
    for i, seg in enumerate(segments, start=1):
        start = format_timestamp(seg["start"], srt=False)
        end = format_timestamp(seg["end"], srt=False)
        text = seg["text"].strip()
        lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(lines)

def generate_word_srt(segments: list) -> str:
    """Generate word-by-word SRT subtitle string for animated/highlighted captions."""
    lines = []
    idx = 1
    for seg in segments:
        words = seg.get("words", [])
        if words:
            for w in words:
                start = format_timestamp(w["start"], srt=True)
                end = format_timestamp(w["end"], srt=True)
                word_text = w.get("word", "").strip()
                if word_text:
                    lines.append(f"{idx}\n{start} --> {end}\n{word_text}\n")
                    idx += 1
        else:
            # Fallback if words not present
            start = format_timestamp(seg["start"], srt=True)
            end = format_timestamp(seg["end"], srt=True)
            text = seg["text"].strip()
            lines.append(f"{idx}\n{start} --> {end}\n{text}\n")
            idx += 1
    return "\n".join(lines)

def get_whisper_model(model_name: str = "small"):
    """Load and cache Whisper model locally."""
    import whisper
    with model_lock:
        if model_name in loaded_models:
            return loaded_models[model_name]
        logger.info(f"Loading Whisper model '{model_name}' from {MODELS_DIR}...")
        model = whisper.load_model(model_name, download_root=str(MODELS_DIR))
        loaded_models[model_name] = model
        logger.info(f"Model '{model_name}' loaded successfully on {model.device}.")
        return model

@app.route("/", methods=["GET"])
def home():
    """Browser root status dashboard."""
    cached_models = [f.stem for f in MODELS_DIR.glob("*.pt")]
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>EDITMATE PRO – Whisper AI Engine</title>
    <style>
        body {{
            background: #07111F;
            color: #F2F8FF;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
        }}
        .card {{
            background: #101E30;
            border: 1px solid rgba(0, 217, 255, 0.3);
            border-radius: 12px;
            padding: 32px;
            max-width: 520px;
            width: 100%;
            box-shadow: 0 0 25px rgba(0, 217, 255, 0.15);
        }}
        h1 {{
            margin-top: 0;
            font-size: 22px;
            color: #F2F8FF;
        }}
        .accent {{ color: #00D9FF; }}
        .badge {{
            display: inline-block;
            background: rgba(0, 230, 118, 0.2);
            color: #00E676;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 20px;
        }}
        .info-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 13px;
        }}
        .label {{ color: #8BA3C4; }}
        .value {{ font-family: monospace; color: #75E8FF; }}
    </style>
</head>
<body>
    <div class="card">
        <h1>⚡ EDITMATE <span class="accent">PRO</span></h1>
        <div class="badge">● Whisper AI Service Online</div>
        <div class="info-row"><span class="label">Status:</span><span class="value">Ready for Premiere Pro</span></div>
        <div class="info-row"><span class="label">Local Port:</span><span class="value">5588</span></div>
        <div class="info-row"><span class="label">Python Version:</span><span class="value">{sys.version.split()[0]}</span></div>
        <div class="info-row"><span class="label">Cached Models:</span><span class="value">{', '.join(cached_models) or 'None'}</span></div>
        <div class="info-row"><span class="label">Endpoint:</span><span class="value"><a href="/health" style="color: #00D9FF;">/health</a></span></div>
    </div>
</body>
</html>"""
    return html

@app.route("/health", methods=["GET"])
@app.route("/status", methods=["GET"])
def health():
    """Service health and environment status."""
    cached_models = [f.stem for f in MODELS_DIR.glob("*.pt")]
    return jsonify({
        "status": "online",
        "service": "EDITMATE PRO Whisper AI Engine",
        "version": "1.0.0",
        "python": sys.version.split()[0],
        "models_dir": str(MODELS_DIR),
        "cached_models": cached_models,
        "loaded_models": list(loaded_models.keys()),
        "active_job": {
            "status": active_job["status"],
            "progress": active_job["progress"],
            "message": active_job["message"]
        }
    })

@app.route("/models", methods=["GET"])
def list_models():
    """List available and cached models."""
    available = ["tiny", "base", "small", "medium", "turbo"]
    cached = [f.stem for f in MODELS_DIR.glob("*.pt")]
    return jsonify({
        "available": available,
        "cached": cached,
        "recommended": "small",
        "description": {
            "tiny": "Fastest (~75MB), lower accuracy, best for quick drafts",
            "base": "Fast (~140MB), good for clean English speech",
            "small": "Recommended (~461MB), excellent balance for Hindi, English & Hinglish",
            "medium": "High accuracy (~1.5GB), slower processing",
            "turbo": "High speed optimized (~1.6GB)"
        }
    })

@app.route("/cancel", methods=["POST"])
def cancel_job():
    """Request cancellation of active transcription."""
    global active_job
    if active_job["status"] == "processing":
        active_job["should_cancel"] = True
        active_job["message"] = "Cancellation requested..."
        return jsonify({"success": True, "message": "Cancellation requested."})
    return jsonify({"success": False, "message": "No active job running."})

@app.route("/progress", methods=["GET"])
def get_progress():
    """Get current transcription progress."""
    return jsonify(active_job)

@app.route("/transcribe", methods=["POST"])
def transcribe_endpoint():
    """
    Main transcription endpoint.
    Accepts JSON body or multipart/form-data.
    """
    global active_job

    if active_job["status"] == "processing":
        return jsonify({
            "error": "A transcription job is already in progress. Please wait or cancel."
        }), 409

    data = request.form if request.form else (request.get_json(silent=True) or {})
    
    # Check for audio path or uploaded file
    audio_path = data.get("audio_path")
    model_name = data.get("model", "small").lower()
    language = data.get("language", "auto")
    task = data.get("task", "transcribe")
    word_timestamps = str(data.get("word_timestamps", "false")).lower() in ["true", "1", "yes"]
    initial_prompt = data.get("initial_prompt", "")
    output_dir_param = data.get("output_dir")

    # If file was uploaded via multipart
    if "audio_file" in request.files:
        upload = request.files["audio_file"]
        temp_dir = BASE_DIR / "engines" / "whisper" / "service" / "temp"
        temp_dir.mkdir(parents=True, exist_ok=True)
        temp_file = temp_dir / upload.filename
        upload.save(str(temp_file))
        audio_path = str(temp_file)

    if not audio_path or not os.path.exists(audio_path):
        return jsonify({"error": f"Audio file not found: {audio_path}"}), 400

    output_dir = Path(output_dir_param) if output_dir_param else DEFAULT_EXPORTS_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    # Initialize job state
    active_job["status"] = "processing"
    active_job["progress"] = 5
    active_job["message"] = f"Initializing {model_name} model..."
    active_job["error"] = None
    active_job["should_cancel"] = False
    active_job["result"] = None

    def run_transcription():
        global active_job
        try:
            active_job["progress"] = 15
            active_job["message"] = f"Loading model '{model_name}'..."
            model = get_whisper_model(model_name)

            if active_job["should_cancel"]:
                raise Exception("Job cancelled by user.")

            active_job["progress"] = 30
            active_job["message"] = "Transcribing audio..."
            logger.info(f"Transcribing '{audio_path}' (lang={language}, word_timestamps={word_timestamps})...")

            # Language configuration
            whisper_lang = None if (not language or language == "auto") else language

            # Hinglish prompt assistance: if language is Hindi or Hinglish, guide Whisper
            prompt = initial_prompt
            if not prompt:
                if language in ["hi", "hinglish"]:
                    prompt = "Namaste. Yeh ek Hindi aur English conversation hai. Haan, bilkul sahi baat hai."
                elif language == "en":
                    prompt = "Hello, this is a clear English transcription."

            transcribe_options = {
                "task": task,
                "verbose": False,
                "word_timestamps": word_timestamps
            }
            if whisper_lang and whisper_lang != "hinglish":
                transcribe_options["language"] = whisper_lang
            if prompt:
                transcribe_options["initial_prompt"] = prompt

            active_job["progress"] = 50
            active_job["message"] = "Whisper neural network analyzing speech..."

            start_time = time.time()
            result = model.transcribe(str(audio_path), **transcribe_options)
            elapsed = time.time() - start_time

            if active_job["should_cancel"]:
                raise Exception("Job cancelled by user.")

            active_job["progress"] = 85
            active_job["message"] = "Formatting subtitles and files..."

            detected_language = result.get("language", language)
            segments = result.get("segments", [])

            # Generate export files
            base_name = Path(audio_path).stem
            srt_content = generate_srt(segments)
            vtt_content = generate_vtt(segments)
            txt_content = result.get("text", "").strip()

            srt_file = output_dir / f"{base_name}.srt"
            vtt_file = output_dir / f"{base_name}.vtt"
            txt_file = output_dir / f"{base_name}.txt"
            json_file = output_dir / f"{base_name}.json"

            srt_file.write_text(srt_content, encoding="utf-8")
            vtt_file.write_text(vtt_content, encoding="utf-8")
            txt_file.write_text(txt_content, encoding="utf-8")

            # If word timestamps requested, generate word-level SRT
            word_srt_file = None
            if word_timestamps:
                word_srt_content = generate_word_srt(segments)
                word_srt_file = output_dir / f"{base_name}_words.srt"
                word_srt_file.write_text(word_srt_content, encoding="utf-8")

            # Export clean JSON for UI preview & editing
            export_data = {
                "audio_file": str(audio_path),
                "model": model_name,
                "detected_language": detected_language,
                "duration_seconds": round(elapsed, 2),
                "text": txt_content,
                "segments": [
                    {
                        "id": seg.get("id", i),
                        "start": seg["start"],
                        "end": seg["end"],
                        "text": seg["text"].strip(),
                        "words": seg.get("words", [])
                    }
                    for i, seg in enumerate(segments)
                ],
                "files": {
                    "srt": str(srt_file),
                    "vtt": str(vtt_file),
                    "txt": str(txt_file),
                    "json": str(json_file),
                    "word_srt": str(word_srt_file) if word_srt_file else None
                }
            }

            json_file.write_text(json.dumps(export_data, indent=2, ensure_ascii=False), encoding="utf-8")

            active_job["progress"] = 100
            active_job["status"] = "completed"
            active_job["message"] = f"Completed in {elapsed:.1f}s ({len(segments)} segments)"
            active_job["result"] = export_data
            logger.info(f"Transcription complete: {len(segments)} segments generated.")

        except Exception as e:
            logger.error(f"Transcription error: {str(e)}", exc_info=True)
            active_job["status"] = "failed"
            active_job["error"] = str(e)
            active_job["message"] = f"Error: {str(e)}"

    thread = threading.Thread(target=run_transcription)
    thread.daemon = True
    thread.start()

    return jsonify({
        "success": True,
        "message": "Transcription started",
        "audio_path": audio_path,
        "model": model_name,
        "language": language
    })

@app.route("/export_srt", methods=["POST"])
def export_srt_endpoint():
    """Save modified transcript from UI to an SRT file."""
    data = request.get_json(force=True)
    segments = data.get("segments", [])
    filename = data.get("filename", f"edited_captions_{int(time.time())}.srt")
    if not filename.endswith(".srt"):
        filename += ".srt"

    output_path = DEFAULT_EXPORTS_DIR / filename
    srt_content = generate_srt(segments)
    output_path.write_text(srt_content, encoding="utf-8")

    return jsonify({
        "success": True,
        "path": str(output_path),
        "filename": filename
    })

@app.route("/detect_silence", methods=["POST"])
def detect_silence():
    """Detect silent intervals using FFmpeg silencedetect filter."""
    import subprocess
    import re

    data = request.get_json(silent=True) or request.form or {}
    audio_path = data.get("audio_path")
    noise_db = data.get("noise_db", -30)
    duration = data.get("min_duration", 0.5)

    if not audio_path or not os.path.exists(audio_path):
        return jsonify({"error": f"Audio file not found: {audio_path}"}), 400

    cmd = [
        "ffmpeg", "-i", str(audio_path),
        "-af", f"silencedetect=noise={noise_db}dB:d={duration}",
        "-f", "null", "-"
    ]

    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="ignore")
        output = proc.stderr

        silence_starts = []
        silence_ends = []
        silences = []

        for line in output.splitlines():
            if "silence_start" in line:
                m = re.search(r"silence_start:\s*([0-9.]+)", line)
                if m:
                    silence_starts.append(float(m.group(1)))
            elif "silence_end" in line:
                m = re.search(r"silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)", line)
                if m:
                    silence_ends.append({
                        "end": float(m.group(1)),
                        "duration": float(m.group(2))
                    })

        for i in range(min(len(silence_starts), len(silence_ends))):
            start = silence_starts[i]
            end = silence_ends[i]["end"]
            dur = silence_ends[i]["duration"]
            silences.append({
                "id": i + 1,
                "start": round(start, 2),
                "end": round(end, 2),
                "duration": round(dur, 2)
            })

        return jsonify({
            "success": True,
            "silence_count": len(silences),
            "silences": silences,
            "settings": {"noise_db": noise_db, "min_duration": duration}
        })
    except Exception as e:
        logger.error(f"Silence detection failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/detect_fillers", methods=["POST"])
def detect_fillers():
    """Detect filler words from Whisper transcript."""
    data = request.get_json(silent=True) or request.form or {}
    audio_path = data.get("audio_path")
    filler_list = [
        "um", "uh", "uhm", "umm", "like", "you know", "actually", 
        "basically", "literally", "matlab", "toh", "yaani", "hmm"
    ]

    if not audio_path or not os.path.exists(audio_path):
        return jsonify({"error": f"Audio file not found: {audio_path}"}), 400

    # Check if JSON transcript already exists
    base_name = Path(audio_path).stem
    json_path = DEFAULT_EXPORTS_DIR / f"{base_name}.json"

    segments = []
    if json_path.exists():
        try:
            cached_data = json.loads(json_path.read_text(encoding="utf-8"))
            segments = cached_data.get("segments", [])
        except Exception:
            pass

    # If no cached transcript, transcribe audio
    if not segments:
        model = get_whisper_model("small")
        res = model.transcribe(str(audio_path), word_timestamps=True)
        segments = res.get("segments", [])

    detected = []
    idx = 1
    for seg in segments:
        words = seg.get("words", [])
        for w in words:
            clean_word = re.sub(r"[^\w]", "", w.get("word", "").lower())
            if clean_word in filler_list:
                detected.append({
                    "id": idx,
                    "word": w.get("word", "").strip(),
                    "start": round(w.get("start", 0), 2),
                    "end": round(w.get("end", 0), 2),
                    "duration": round(w.get("end", 0) - w.get("start", 0), 2)
                })
                idx += 1

    return jsonify({
        "success": True,
        "filler_count": len(detected),
        "fillers": detected
    })

@app.route("/detect_retakes", methods=["POST"])
def detect_retakes():
    """Detect repeated phrases and retakes in speech."""
    data = request.get_json(silent=True) or request.form or {}
    audio_path = data.get("audio_path")

    if not audio_path or not os.path.exists(audio_path):
        return jsonify({"error": f"Audio file not found: {audio_path}"}), 400

    base_name = Path(audio_path).stem
    json_path = DEFAULT_EXPORTS_DIR / f"{base_name}.json"

    segments = []
    if json_path.exists():
        try:
            cached_data = json.loads(json_path.read_text(encoding="utf-8"))
            segments = cached_data.get("segments", [])
        except Exception:
            pass

    if not segments:
        model = get_whisper_model("small")
        res = model.transcribe(str(audio_path), word_timestamps=False)
        segments = res.get("segments", [])

    # Find text repetitions
    retakes = []
    for i in range(len(segments) - 1):
        seg1 = segments[i]["text"].strip().lower()
        seg2 = segments[i + 1]["text"].strip().lower()
        # Word set overlap
        words1 = set(re.findall(r"\w+", seg1))
        words2 = set(re.findall(r"\w+", seg2))
        if words1 and words2:
            intersection = words1.intersection(words2)
            similarity = len(intersection) / max(len(words1), len(words2))
            if similarity > 0.6 and len(intersection) >= 3:
                retakes.append({
                    "id": len(retakes) + 1,
                    "take1": {"start": segments[i]["start"], "end": segments[i]["end"], "text": segments[i]["text"]},
                    "take2": {"start": segments[i + 1]["start"], "end": segments[i + 1]["end"], "text": segments[i + 1]["text"]},
                    "similarity": round(similarity * 100, 1),
                    "suggested_cut": {"start": segments[i]["start"], "end": segments[i]["end"]}
                })

    return jsonify({
        "success": True,
        "retake_count": len(retakes),
        "retakes": retakes
    })

if __name__ == "__main__":
    port = 5588
    logger.info("==================================================")
    logger.info(f" EDITMATE PRO - Whisper AI Service starting on port {port}")
    logger.info(f" Models directory: {MODELS_DIR}")
    logger.info(f" Exports directory: {DEFAULT_EXPORTS_DIR}")
    logger.info("==================================================")
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)
