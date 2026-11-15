/**
 * EDITMATE PRO – Cutting Tools Engine
 * Real timeline operations & AI Silence, Filler, Retake detection
 */

const CuttingPage = (() => {
    const serviceUrl = "http://127.0.0.1:5588";

    function render() {
        const page = UI.create('div', { className: 'tool-page' });

        page.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">✂️ Cutting Tools</h2>
                <p class="page-subtitle">Timeline editing, silence removal & AI clip manipulation</p>
            </div>

            <!-- AI Speech & Silence Analysis -->
            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">🤖 AI Silence & Retake Detection</span>
                    <span class="badge badge-success">AI Powered</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Sequence Audio File</label>
                    <div style="display: flex; gap: var(--space-xs);">
                        <input type="text" class="form-input" id="cut-audio-path" placeholder="C:\\path\\to\\audio.wav (or MP4, MP3)">
                        <button class="btn btn-secondary btn-sm" id="btn-cut-detect-media">🎯 Timeline Clip</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); margin-bottom: var(--space-md);">
                    <div>
                        <label class="form-label">Silence Threshold (dB)</label>
                        <input type="number" class="form-input" id="silence-threshold" value="-30" min="-60" max="-10">
                    </div>
                    <div>
                        <label class="form-label">Min Silence Duration (s)</label>
                        <input type="number" class="form-input" id="silence-duration" value="0.5" step="0.1" min="0.2" max="5">
                    </div>
                </div>

                <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
                    <button class="btn btn-primary btn-sm" id="btn-detect-silence">
                        🔇 Detect Silence
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-detect-fillers">
                        💬 Find Filler Words
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-detect-retakes">
                        🔁 Detect Retakes
                    </button>
                </div>

                <!-- Analysis Results Box -->
                <div id="cutting-results-box" class="hidden" style="margin-top: var(--space-md); padding: var(--space-sm); background: var(--bg-input); border-radius: var(--radius-md); border: 1px solid var(--border-active);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
                        <span id="cutting-results-title" style="font-weight: 700; color: var(--accent-primary);">Results</span>
                        <span id="cutting-results-count" class="badge badge-info">0 detected</span>
                    </div>
                    <div id="cutting-results-list" style="max-height: 180px; overflow-y: auto; font-size: 11px; display: flex; flex-direction: column; gap: 4px;"></div>
                </div>
            </div>

            <!-- Instant Timeline Actions -->
            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">⚡ Instant Timeline Actions</span>
                    <span class="badge badge-success">Active</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                    
                    <div class="action-row" style="padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div class="action-info">
                            <div class="action-name">✂️ Split at Playhead</div>
                            <div class="action-desc">Cuts active sequence clips at the current playhead position</div>
                        </div>
                        <button class="btn btn-primary btn-sm" id="btn-split-playhead">Split (Cut)</button>
                    </div>

                    <div class="action-row" style="padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div class="action-info">
                            <div class="action-name">⏪ Trim Before Playhead</div>
                            <div class="action-desc">Ripple trims the start of clip to the playhead position</div>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="btn-trim-before">Trim Start</button>
                    </div>

                    <div class="action-row" style="padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div class="action-info">
                            <div class="action-name">⏩ Trim After Playhead</div>
                            <div class="action-desc">Ripple trims the end of clip to the playhead position</div>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="btn-trim-after">Trim End</button>
                    </div>

                    <div class="action-row" style="padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div class="action-info">
                            <div class="action-name">🔗 Close Timeline Gaps</div>
                            <div class="action-desc">Identifies and removes empty spaces between clips on tracks</div>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="btn-close-gaps">Close Gaps</button>
                    </div>

                </div>
            </div>

            <!-- Advanced Operations -->
            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">🔧 Sequence & Marker Tools</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-sm);">

                    <div class="action-row" style="padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div class="action-info">
                            <div class="action-name">↔️ Offset Clips</div>
                            <div class="action-desc">Shift selected track items forward or backward by seconds</div>
                        </div>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <input type="number" id="offset-amount" value="1.0" step="0.5" style="width: 50px; background: var(--bg-input); padding: 4px; border-radius: 4px; border: 1px solid var(--border-subtle); color: var(--text-primary); text-align: center; font-size: 11px;">
                            <button class="btn btn-secondary btn-sm" id="btn-offset-clips">Offset</button>
                        </div>
                    </div>

                    <div class="action-row" style="padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                        <div class="action-info">
                            <div class="action-name">🏷️ Timeline Markers</div>
                            <div class="action-desc">Inspect all markers on the active sequence</div>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="btn-read-markers">Read Markers</button>
                    </div>

                </div>
            </div>
        `;

        return page;
    }

    function init() {
        // 1. Auto detect timeline media
        const detectMediaBtn = UI.$('#btn-cut-detect-media');
        if (detectMediaBtn) {
            detectMediaBtn.addEventListener('click', async () => {
                if (!PremiereAPI.isAvailable()) {
                    UI.toast('Premiere Pro API not connected. Please enter file path manually.', 'warning');
                    return;
                }
                const path = await PremiereAPI.getActiveSequenceMediaPath();
                if (path) {
                    UI.$('#cut-audio-path').value = path;
                    UI.toast('Detected media from timeline: ' + path.split('\\').pop(), 'success');
                } else {
                    UI.toast('No media file found on active tracks. Paste file path directly.', 'info');
                }
            });
        }

        // 2. Detect Silence
        const silenceBtn = UI.$('#btn-detect-silence');
        if (silenceBtn) {
            silenceBtn.addEventListener('click', runSilenceDetection);
        }

        // 3. Detect Fillers
        const fillersBtn = UI.$('#btn-detect-fillers');
        if (fillersBtn) {
            fillersBtn.addEventListener('click', runFillerDetection);
        }

        // 4. Detect Retakes
        const retakesBtn = UI.$('#btn-detect-retakes');
        if (retakesBtn) {
            retakesBtn.addEventListener('click', runRetakeDetection);
        }

        // 5. Split at Playhead
        const splitBtn = UI.$('#btn-split-playhead');
        if (splitBtn) {
            splitBtn.addEventListener('click', async () => {
                if (!PremiereAPI.isAvailable()) {
                    UI.toast('Premiere Pro not connected', 'warning');
                    return;
                }
                const res = await PremiereAPI.splitAtPlayhead();
                UI.toast(res.message, res.success ? 'success' : 'error');
            });
        }

        // 6. Trim Before Playhead
        const trimBeforeBtn = UI.$('#btn-trim-before');
        if (trimBeforeBtn) {
            trimBeforeBtn.addEventListener('click', async () => {
                if (!PremiereAPI.isAvailable()) {
                    UI.toast('Premiere Pro not connected', 'warning');
                    return;
                }
                const res = await PremiereAPI.trimBeforePlayhead();
                UI.toast(res.message || 'Trim executed', res.success ? 'success' : 'error');
            });
        }

        // 7. Trim After Playhead
        const trimAfterBtn = UI.$('#btn-trim-after');
        if (trimAfterBtn) {
            trimAfterBtn.addEventListener('click', async () => {
                if (!PremiereAPI.isAvailable()) {
                    UI.toast('Premiere Pro not connected', 'warning');
                    return;
                }
                const res = await PremiereAPI.trimAfterPlayhead();
                UI.toast(res.message || 'Trim executed', res.success ? 'success' : 'error');
            });
        }

        // 8. Close Gaps
        const closeGapsBtn = UI.$('#btn-close-gaps');
        if (closeGapsBtn) {
            closeGapsBtn.addEventListener('click', async () => {
                if (!PremiereAPI.isAvailable()) {
                    UI.toast('Premiere Pro not connected', 'warning');
                    return;
                }
                const res = await PremiereAPI.closeGaps();
                UI.toast(res.message, res.success ? 'success' : 'info');
            });
        }

        // 9. Read Markers
        const markersBtn = UI.$('#btn-read-markers');
        if (markersBtn) {
            markersBtn.addEventListener('click', async () => {
                if (!PremiereAPI.isAvailable()) {
                    UI.toast('Premiere Pro not connected', 'warning');
                    return;
                }
                const markers = await PremiereAPI.getMarkers();
                UI.toast(`Found ${markers.length} markers on timeline`, 'info');
            });
        }
    }

    async function runSilenceDetection() {
        const audioPath = UI.$('#cut-audio-path')?.value?.trim();
        if (!audioPath) {
            UI.toast('Please enter or auto-detect an audio/video file path', 'warning');
            return;
        }

        const threshold = UI.$('#silence-threshold').value;
        const duration = UI.$('#silence-duration').value;

        UI.toast('Analyzing audio for silence...', 'info');

        try {
            const res = await fetch(`${serviceUrl}/detect_silence`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audio_path: audioPath,
                    noise_db: parseFloat(threshold),
                    min_duration: parseFloat(duration)
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Silence detection failed");

            displaySilenceResults(data.silences);
            UI.toast(`Detected ${data.silence_count} silent segments!`, 'success');

        } catch (e) {
            UI.toast('Silence error: ' + e.message, 'error');
        }
    }

    async function runFillerDetection() {
        const audioPath = UI.$('#cut-audio-path')?.value?.trim();
        if (!audioPath) {
            UI.toast('Please enter or auto-detect an audio/video file path', 'warning');
            return;
        }

        UI.toast('Searching transcript for filler words (um, uh, like)...', 'info');

        try {
            const res = await fetch(`${serviceUrl}/detect_fillers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio_path: audioPath })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Filler detection failed");

            displayFillerResults(data.fillers);
            UI.toast(`Detected ${data.filler_count} filler words!`, 'success');

        } catch (e) {
            UI.toast('Filler detection error: ' + e.message, 'error');
        }
    }

    async function runRetakeDetection() {
        const audioPath = UI.$('#cut-audio-path')?.value?.trim();
        if (!audioPath) {
            UI.toast('Please enter or auto-detect an audio/video file path', 'warning');
            return;
        }

        UI.toast('Analyzing speech for repeated retakes...', 'info');

        try {
            const res = await fetch(`${serviceUrl}/detect_retakes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio_path: audioPath })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Retake detection failed");

            displayRetakeResults(data.retakes);
            UI.toast(`Found ${data.retake_count} potential retakes!`, 'success');

        } catch (e) {
            UI.toast('Retake error: ' + e.message, 'error');
        }
    }

    function displaySilenceResults(silences) {
        const box = UI.$('#cutting-results-box');
        const list = UI.$('#cutting-results-list');
        const count = UI.$('#cutting-results-count');
        const title = UI.$('#cutting-results-title');

        if (!box || !list) return;

        box.classList.remove('hidden');
        title.textContent = "🔇 Detected Silence Intervals";
        count.textContent = `${silences.length} cuts found`;

        list.innerHTML = '';
        if (silences.length === 0) {
            list.innerHTML = '<div style="color: var(--text-muted); padding: 8px;">No silent segments found exceeding minimum duration.</div>';
            return;
        }

        silences.forEach(s => {
            const row = document.createElement('div');
            row.style.cssText = "display: flex; justify-content: space-between; padding: 4px 8px; background: var(--bg-secondary); border-radius: 4px;";
            row.innerHTML = `
                <span>#${s.id} &bull; ${s.start}s &rarr; ${s.end}s</span>
                <span style="color: var(--color-warning); font-weight: 600;">-${s.duration}s</span>
            `;
            list.appendChild(row);
        });
    }

    function displayFillerResults(fillers) {
        const box = UI.$('#cutting-results-box');
        const list = UI.$('#cutting-results-list');
        const count = UI.$('#cutting-results-count');
        const title = UI.$('#cutting-results-title');

        if (!box || !list) return;

        box.classList.remove('hidden');
        title.textContent = "💬 Detected Filler Words";
        count.textContent = `${fillers.length} fillers found`;

        list.innerHTML = '';
        if (fillers.length === 0) {
            list.innerHTML = '<div style="color: var(--text-muted); padding: 8px;">No filler words detected. Clean speech!</div>';
            return;
        }

        fillers.forEach(f => {
            const row = document.createElement('div');
            row.style.cssText = "display: flex; justify-content: space-between; padding: 4px 8px; background: var(--bg-secondary); border-radius: 4px;";
            row.innerHTML = `
                <span style="font-weight: 600; color: var(--accent-secondary);">${escapeHtml(f.word)}</span>
                <span>${f.start}s &rarr; ${f.end}s (${f.duration}s)</span>
            `;
            list.appendChild(row);
        });
    }

    function displayRetakeResults(retakes) {
        const box = UI.$('#cutting-results-box');
        const list = UI.$('#cutting-results-list');
        const count = UI.$('#cutting-results-count');
        const title = UI.$('#cutting-results-title');

        if (!box || !list) return;

        box.classList.remove('hidden');
        title.textContent = "🔁 Detected Duplicate Retakes";
        count.textContent = `${retakes.length} retakes found`;

        list.innerHTML = '';
        if (retakes.length === 0) {
            list.innerHTML = '<div style="color: var(--text-muted); padding: 8px;">No repeated sentence takes detected.</div>';
            return;
        }

        retakes.forEach(r => {
            const row = document.createElement('div');
            row.style.cssText = "padding: 6px 8px; background: var(--bg-secondary); border-radius: 4px; margin-bottom: 4px;";
            row.innerHTML = `
                <div style="display: flex; justify-content: space-between; color: var(--color-warning); font-weight: 600;">
                    <span>Retake #${r.id} (${r.similarity}% match)</span>
                    <span>Cut: ${r.suggested_cut.start}s - ${r.suggested_cut.end}s</span>
                </div>
                <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
                    Take 1: "${escapeHtml(r.take1.text)}"<br>
                    Take 2: "${escapeHtml(r.take2.text)}"
                </div>
            `;
            list.appendChild(row);
        });
    }

    function escapeHtml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return { render, init };
})();

Router.register('cutting', CuttingPage);
