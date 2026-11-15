/**
 * EDITMATE PRO – Captions & Subtitles Engine
 * Full integration with local OpenAI Whisper AI Engine (port 5588)
 */

const CaptionsPage = (() => {
    let serviceUrl = "http://127.0.0.1:5588";
    let isServiceOnline = false;
    let pollInterval = null;
    let currentTranscriptData = null;
    let selectedStylePreset = "cyan";

    const stylePresets = [
        {
            id: "cyan",
            name: "Cyber Cyan (Default)",
            previewBg: "#07111F",
            previewColor: "#00D9FF",
            sample: "EDITMATE PRO",
            font: "Montserrat / Bold",
            desc: "Cyan accent with dark contrast shadow"
        },
        {
            id: "yellow",
            name: "Viral Yellow (Reels)",
            previewBg: "#101010",
            previewColor: "#FFE600",
            sample: "VIRAL CAPTION",
            font: "Impact / The Bold Font",
            desc: "High retention Shorts & Reels style"
        },
        {
            id: "minimal",
            name: "Clean Minimalist",
            previewBg: "rgba(0,0,0,0.7)",
            previewColor: "#FFFFFF",
            sample: "Subtitle text",
            font: "Arial / Roboto",
            desc: "Documentary and YouTube longform style"
        },
        {
            id: "hormozi",
            name: "Hormozi Pop",
            previewBg: "#00E676",
            previewColor: "#000000",
            sample: "ONE WORD",
            font: "Futura Extra Bold",
            desc: "Rapid word-by-word highlighted text"
        }
    ];

    function render() {
        const page = UI.create('div', { className: 'tool-page' });

        page.innerHTML = `
            <div class="page-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 class="page-title">💬 AI Captions Studio</h2>
                        <p class="page-subtitle">Local offline OpenAI Whisper speech-to-text</p>
                    </div>
                    <div id="service-status-pill" class="badge badge-warning" style="cursor: pointer;" title="Click to refresh status">
                        Checking Engine...
                    </div>
                </div>
            </div>

            <!-- Service Offline Alert (hidden when online) -->
            <div id="service-offline-alert" class="section-card hidden" style="border-color: var(--color-warning);">
                <div style="display: flex; gap: var(--space-md); align-items: center;">
                    <span style="font-size: 24px;">⚠️</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--color-warning);">Whisper AI Engine Not Running</div>
                        <div style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-top: 2px;">
                            Start the local service: run <code>start_whisper_service.bat</code> in the project folder.
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" id="btn-check-service">🔄 Recheck</button>
                </div>
            </div>

            <!-- Transcription Configuration -->
            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">🎙️ Audio Input</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Audio / Video File Path</label>
                    <div style="display: flex; gap: var(--space-xs);">
                        <input type="text" class="form-input" id="caption-audio-path" 
                               placeholder="C:\\path\\to\\audio.wav (or MP3, M4A, MP4)">
                        <button class="btn btn-secondary btn-sm" id="btn-detect-timeline" title="Auto-detect source media from active sequence clip">
                            🎯 Timeline Clip
                        </button>
                    </div>
                </div>

                <div style="display: flex; gap: var(--space-xs); margin-bottom: var(--space-md);">
                    <button class="btn btn-secondary btn-sm" id="btn-sample-en">🔊 Load English Sample</button>
                    <button class="btn btn-secondary btn-sm" id="btn-sample-hi">🔊 Load Hinglish Sample</button>
                </div>

                <div class="caption-studio-grid">
                    <div>
                        <label class="form-label">Whisper Model</label>
                        <select class="form-select" id="whisper-model-select">
                            <option value="small" selected>Small (~461MB) [Recommended - Cached]</option>
                            <option value="base">Base (~140MB) [Fast English]</option>
                            <option value="tiny">Tiny (~75MB) [Ultra Fast]</option>
                            <option value="medium">Medium (~1.5GB) [High Accuracy]</option>
                            <option value="turbo">Turbo (~1.6GB) [Speed Optimized]</option>
                        </select>
                    </div>

                    <div>
                        <label class="form-label">Language</label>
                        <select class="form-select" id="whisper-lang-select">
                            <option value="auto" selected>🌐 Auto Detect</option>
                            <option value="en">🇺🇸 English</option>
                            <option value="hi">🇮🇳 Hindi (हिन्दी)</option>
                            <option value="hinglish">🇮🇳 Hinglish (Hindi + English)</option>
                        </select>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding: var(--space-xs) 0;">
                    <div>
                        <div style="font-size: var(--font-size-sm); font-weight: 500;">Word-Level Timestamps</div>
                        <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Enables word-by-word animation and accurate sync</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-word-timestamps" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <button class="btn btn-primary" id="btn-start-transcribe" style="width: 100%;">
                    ⚡ Generate Captions
                </button>
            </div>

            <!-- Live Progress Box (Hidden when idle) -->
            <div id="transcribe-progress-box" class="progress-box hidden">
                <div class="progress-header">
                    <span id="progress-status-msg" style="font-weight: 600;">Processing speech...</span>
                    <span id="progress-pct" style="color: var(--accent-primary); font-weight: 700;">0%</span>
                </div>
                <div class="progress-bar" style="margin-bottom: var(--space-sm);">
                    <div id="progress-bar-fill" class="progress-fill" style="width: 0%;"></div>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="btn btn-danger btn-sm" id="btn-cancel-transcribe">Cancel</button>
                </div>
            </div>

            <!-- Interactive Transcript Editor (Shown when results available) -->
            <div id="transcript-results-section" class="section-card hidden">
                <div class="section-card-header">
                    <span class="section-card-title">📝 Transcript Editor</span>
                    <div id="transcript-stats-badge" class="badge badge-info">0 Segments</div>
                </div>

                <div id="transcript-container" class="transcript-editor">
                    <!-- Segments rendered dynamically -->
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-md);">
                    <button class="btn btn-primary btn-sm" id="btn-import-premiere">
                        📥 Import to Premiere Project
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-save-srt">
                        💾 Save Modified SRT
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-copy-srt-path">
                        📋 Copy SRT Path
                    </button>
                </div>

                <!-- Premiere placement instructions -->
                <div style="margin-top: var(--space-md); padding: var(--space-sm); background: var(--bg-tertiary); border-radius: var(--radius-sm); font-size: 11px; color: var(--text-secondary);">
                    💡 <strong>Timeline Placement:</strong> Once imported into your Project bin, simply drag the <code>.srt</code> item onto your timeline. Premiere Pro 2026 will automatically create a native Subtitle track!
                </div>
            </div>

            <!-- Caption Style Presets -->
            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">🎨 Caption Style Presets</span>
                </div>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-xs);">
                    Choose a visual style preset for styling inside Premiere's Essential Graphics:
                </p>
                <div class="style-presets-grid" id="style-presets-container">
                    <!-- Style preset cards rendered dynamically -->
                </div>
            </div>
        `;

        return page;
    }

    function init() {
        renderStylePresets();
        checkServiceStatus();

        // Service recheck
        const checkBtn = UI.$('#btn-check-service');
        const statusPill = UI.$('#service-status-pill');
        if (checkBtn) checkBtn.addEventListener('click', checkServiceStatus);
        if (statusPill) statusPill.addEventListener('click', checkServiceStatus);

        // Sample audio loaders
        const sampleEnBtn = UI.$('#btn-sample-en');
        if (sampleEnBtn) {
            sampleEnBtn.addEventListener('click', () => {
                const p = "C:\\Users\\nikhil\\.gemini\\antigravity\\scratch\\EDITMATE-PRO\\exports\\subtitles\\test_sample_en.wav";
                UI.$('#caption-audio-path').value = p;
                UI.toast('Loaded English sample audio', 'info');
            });
        }

        const sampleHiBtn = UI.$('#btn-sample-hi');
        if (sampleHiBtn) {
            sampleHiBtn.addEventListener('click', () => {
                const p = "C:\\Users\\nikhil\\.gemini\\antigravity\\scratch\\EDITMATE-PRO\\exports\\subtitles\\test_sample_hinglish.wav";
                UI.$('#caption-audio-path').value = p;
                UI.$('#whisper-lang-select').value = "hinglish";
                UI.toast('Loaded Hinglish sample audio', 'info');
            });
        }

        // Timeline auto-detect
        const detectBtn = UI.$('#btn-detect-timeline');
        if (detectBtn) {
            detectBtn.addEventListener('click', async () => {
                if (!PremiereAPI.isAvailable()) {
                    UI.toast('Premiere Pro API not connected. Please enter file path manually.', 'warning');
                    return;
                }
                const path = await PremiereAPI.getActiveSequenceMediaPath();
                if (path) {
                    UI.$('#caption-audio-path').value = path;
                    UI.toast('Detected media from timeline: ' + path.split('\\').pop(), 'success');
                } else {
                    UI.toast('No media file found on active timeline tracks. Enter path manually.', 'info');
                }
            });
        }

        // Start transcription
        const startBtn = UI.$('#btn-start-transcribe');
        if (startBtn) {
            startBtn.addEventListener('click', startTranscription);
        }

        // Cancel transcription
        const cancelBtn = UI.$('#btn-cancel-transcribe');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', cancelTranscription);
        }

        // Import to Premiere
        const importBtn = UI.$('#btn-import-premiere');
        if (importBtn) {
            importBtn.addEventListener('click', importSRTToPremiere);
        }

        // Save SRT
        const saveBtn = UI.$('#btn-save-srt');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveModifiedSRT);
        }

        // Copy path
        const copyBtn = UI.$('#btn-copy-srt-path');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (currentTranscriptData && currentTranscriptData.files && currentTranscriptData.files.srt) {
                    const srtPath = currentTranscriptData.files.srt;
                    navigator.clipboard.writeText(srtPath);
                    UI.toast('Copied to clipboard: ' + srtPath, 'success');
                }
            });
        }
    }

    function cleanup() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    async function checkServiceStatus() {
        const pill = UI.$('#service-status-pill');
        const alertBox = UI.$('#service-offline-alert');

        try {
            // Standard fetch without AbortSignal.timeout for UXP compatibility
            const res = await fetch(`${serviceUrl}/health`);
            if (res.ok) {
                const data = await res.json();
                isServiceOnline = true;
                if (pill) {
                    pill.className = "badge badge-success";
                    pill.textContent = "🟢 Whisper Online";
                }
                if (alertBox) alertBox.classList.add('hidden');
                EditMateState.set('pythonServiceConnected', true);
                return true;
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (e) {
            console.error('[EditMate] Whisper health check failed:', e);
            isServiceOnline = false;
            if (pill) {
                pill.className = "badge badge-error";
                pill.textContent = "🔴 Whisper Offline";
            }
            if (alertBox) alertBox.classList.remove('hidden');
            EditMateState.set('pythonServiceConnected', false);
            return false;
        }
    }

    async function startTranscription() {
        const audioPath = UI.$('#caption-audio-path')?.value?.trim();
        if (!audioPath) {
            UI.toast('Please select or enter an audio/video file path', 'warning');
            return;
        }

        const isOnline = await checkServiceStatus();
        if (!isOnline) {
            UI.toast('Whisper AI service is offline. Run start_whisper_service.bat first.', 'error');
            return;
        }

        const model = UI.$('#whisper-model-select').value;
        const language = UI.$('#whisper-lang-select').value;
        const wordTimestamps = UI.$('#toggle-word-timestamps').checked;

        // UI progress update
        showProgressBox(true);
        updateProgress(5, "Connecting to Whisper AI service...");

        try {
            const response = await fetch(`${serviceUrl}/transcribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audio_path: audioPath,
                    model: model,
                    language: language,
                    word_timestamps: wordTimestamps
                })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to start transcription");
            }

            // Start polling progress
            pollInterval = setInterval(pollProgress, 1000);

        } catch (err) {
            showProgressBox(false);
            UI.toast('Transcription error: ' + err.message, 'error');
        }
    }

    async function pollProgress() {
        try {
            const res = await fetch(`${serviceUrl}/progress`);
            if (!res.ok) return;
            const job = await res.json();

            updateProgress(job.progress, job.message);

            if (job.status === "completed") {
                clearInterval(pollInterval);
                pollInterval = null;
                showProgressBox(false);
                UI.toast('Captions generated successfully!', 'success');
                displayTranscript(job.result);
            } else if (job.status === "failed") {
                clearInterval(pollInterval);
                pollInterval = null;
                showProgressBox(false);
                UI.toast(job.error || 'Transcription failed', 'error');
            }
        } catch (e) {
            console.error('Progress poll error:', e);
        }
    }

    async function cancelTranscription() {
        try {
            await fetch(`${serviceUrl}/cancel`, { method: "POST" });
            UI.toast('Cancellation requested...', 'info');
        } catch (e) {
            console.error(e);
        }
    }

    function showProgressBox(visible) {
        const box = UI.$('#transcribe-progress-box');
        if (box) box.classList.toggle('hidden', !visible);
        const startBtn = UI.$('#btn-start-transcribe');
        if (startBtn) startBtn.disabled = visible;
    }

    function updateProgress(pct, msg) {
        const bar = UI.$('#progress-bar-fill');
        const pctEl = UI.$('#progress-pct');
        const msgEl = UI.$('#progress-status-msg');

        if (bar) bar.style.width = `${pct}%`;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (msgEl) msgEl.textContent = msg || 'Processing...';
    }

    function displayTranscript(result) {
        currentTranscriptData = result;
        const section = UI.$('#transcript-results-section');
        const container = UI.$('#transcript-container');
        const statsBadge = UI.$('#transcript-stats-badge');

        if (!result || !result.segments) return;

        if (section) section.classList.remove('hidden');
        if (statsBadge) {
            statsBadge.textContent = `${result.segments.length} Segments | Lang: ${result.detected_language.toUpperCase()} | ${result.duration_seconds}s`;
        }

        if (!container) return;
        container.innerHTML = '';

        result.segments.forEach((seg, index) => {
            const item = UI.create('div', { className: 'segment-item' });

            const startFormatted = formatTime(seg.start);
            const endFormatted = formatTime(seg.end);

            let wordsHtml = '';
            if (seg.words && seg.words.length > 0) {
                wordsHtml = `<div class="word-pills-container">` + 
                    seg.words.map(w => `<span class="word-pill" title="${w.start.toFixed(2)}s - ${w.end.toFixed(2)}s">${escapeHtml(w.word.trim())}</span>`).join('') +
                    `</div>`;
            }

            item.innerHTML = `
                <div class="segment-meta">
                    <span>#${index + 1} &bull; ${startFormatted} &rarr; ${endFormatted}</span>
                    <span>${seg.end - seg.start > 0 ? (seg.end - seg.start).toFixed(2) + 's' : ''}</span>
                </div>
                <textarea class="segment-text-input" data-index="${index}" rows="2">${escapeHtml(seg.text)}</textarea>
                ${wordsHtml}
            `;

            // Auto-update segment text in memory on edit
            const textarea = item.querySelector('textarea');
            textarea.addEventListener('input', (e) => {
                seg.text = e.target.value;
            });

            container.appendChild(item);
        });
    }

    async function saveModifiedSRT() {
        if (!currentTranscriptData || !currentTranscriptData.segments) {
            UI.toast('No transcript available to save', 'warning');
            return;
        }

        try {
            const fileName = `captions_edited_${Date.now()}.srt`;
            const res = await fetch(`${serviceUrl}/export_srt`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    segments: currentTranscriptData.segments,
                    filename: fileName
                })
            });
            const data = await res.json();
            if (res.ok) {
                currentTranscriptData.files.srt = data.path;
                UI.toast(`Saved modified SRT to: ${data.filename}`, 'success');
            }
        } catch (e) {
            UI.toast('Failed to save SRT: ' + e.message, 'error');
        }
    }

    async function importSRTToPremiere() {
        if (!currentTranscriptData || !currentTranscriptData.files || !currentTranscriptData.files.srt) {
            UI.toast('No SRT file available yet. Generate captions first.', 'warning');
            return;
        }

        const srtPath = currentTranscriptData.files.srt;

        if (PremiereAPI.isAvailable()) {
            const success = await PremiereAPI.importFiles([srtPath]);
            if (success) {
                UI.toast('SRT imported into Premiere Project Bin! Drag it onto the timeline to create captions.', 'success', 6000);
            } else {
                navigator.clipboard.writeText(srtPath);
                UI.toast('SRT path copied to clipboard. In Premiere: File → Import...', 'info', 5000);
            }
        } else {
            navigator.clipboard.writeText(srtPath);
            UI.toast('SRT Path copied! (Running outside Premiere Pro)', 'info');
        }
    }

    function renderStylePresets() {
        const container = UI.$('#style-presets-container');
        if (!container) return;
        container.innerHTML = '';

        stylePresets.forEach(preset => {
            const card = UI.create('div', {
                className: `style-preset-card${preset.id === selectedStylePreset ? ' active' : ''}`,
                events: {
                    click: () => {
                        selectedStylePreset = preset.id;
                        UI.$$('.style-preset-card').forEach(c => c.classList.remove('active'));
                        card.classList.add('active');
                        UI.toast(`Applied style: ${preset.name}`, 'info');
                    }
                }
            });

            card.innerHTML = `
                <div class="preset-preview-box" style="background: ${preset.previewBg}; color: ${preset.previewColor};">
                    ${preset.sample}
                </div>
                <div style="font-weight: 600; font-size: 11px;">${preset.name}</div>
                <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px;">${preset.font}</div>
            `;

            container.appendChild(card);
        });
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.floor((seconds - Math.floor(seconds)) * 100);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }

    function escapeHtml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return { render, init, cleanup };
})();

Router.register('captions', CaptionsPage);
