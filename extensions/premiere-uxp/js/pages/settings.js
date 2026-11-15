/**
 * EDITMATE PRO – Settings Page
 */

const SettingsPage = (() => {
    function render() {
        const page = UI.create('div', { className: 'tool-page' });

        page.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">⚙️ Settings</h2>
                <p class="page-subtitle">Configure EDITMATE PRO preferences</p>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">General</h3>

                <div class="settings-row">
                    <div class="settings-label">
                        <div class="settings-name">Show Tooltips</div>
                        <div class="settings-desc">Display helpful tooltips on hover</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="setting-tooltips" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="settings-row">
                    <div class="settings-label">
                        <div class="settings-name">Confirm Destructive Operations</div>
                        <div class="settings-desc">Ask before deleting or modifying clips</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="setting-confirm" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="settings-row">
                    <div class="settings-label">
                        <div class="settings-name">Auto-Save Settings</div>
                        <div class="settings-desc">Automatically save settings on change</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="setting-autosave" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">AI Services</h3>

                <div class="settings-row">
                    <div class="settings-label">
                        <div class="settings-name">Enable Python AI Service</div>
                        <div class="settings-desc">Connect to local Python service for AI processing</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="setting-python">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="form-group" style="margin-top: var(--space-md);">
                    <label class="form-label">Python Service Port</label>
                    <input type="number" class="form-input" id="setting-python-port" value="5588" min="1024" max="65535">
                </div>

                <div class="form-group">
                    <label class="form-label">FFmpeg Path</label>
                    <input type="text" class="form-input" id="setting-ffmpeg" placeholder="Leave empty for system PATH">
                </div>

                <div class="form-group">
                    <label class="form-label">Whisper Model</label>
                    <select class="form-select" id="setting-whisper-model">
                        <option value="tiny">Tiny (fastest, least accurate)</option>
                        <option value="base" selected>Base (good balance)</option>
                        <option value="small">Small (better accuracy)</option>
                        <option value="medium">Medium (high accuracy)</option>
                        <option value="large">Large (best accuracy, slowest)</option>
                    </select>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">B-Roll APIs</h3>

                <div class="form-group">
                    <label class="form-label">Pexels API Key</label>
                    <input type="password" class="form-input" id="setting-pexels-key" placeholder="Enter your Pexels API key">
                </div>

                <div class="form-group">
                    <label class="form-label">Pixabay API Key</label>
                    <input type="password" class="form-input" id="setting-pixabay-key" placeholder="Enter your Pixabay API key">
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">Captions</h3>

                <div class="form-group">
                    <label class="form-label">Default Font Size</label>
                    <input type="number" class="form-input" id="setting-caption-size" value="48" min="12" max="120">
                </div>

                <div class="form-group">
                    <label class="form-label">Max Characters Per Line</label>
                    <input type="number" class="form-input" id="setting-caption-chars" value="42" min="20" max="80">
                </div>

                <div class="form-group">
                    <label class="form-label">Caption Position</label>
                    <select class="form-select" id="setting-caption-position">
                        <option value="bottom" selected>Bottom</option>
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                    </select>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">About</h3>
                <div style="padding: var(--space-md) 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
                    <p><strong style="color: var(--text-primary);">EDITMATE PRO</strong> v1.0.0</p>
                    <p style="margin-top: var(--space-xs);">Professional editing assistant for Adobe Premiere Pro 2026</p>
                    <p style="margin-top: var(--space-xs); color: var(--text-muted);">Built with UXP • Made for editors</p>
                </div>
            </div>

            <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-lg);">
                <button class="btn btn-primary" id="settings-save-btn">💾 Save Settings</button>
                <button class="btn btn-danger" id="settings-reset-btn">🔄 Reset to Defaults</button>
            </div>
        `;

        return page;
    }

    function init() {
        loadSettings();

        // Save button
        const saveBtn = UI.$('#settings-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveSettings);
        }

        // Reset button
        const resetBtn = UI.$('#settings-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                UI.confirm(
                    'Reset Settings',
                    'Are you sure you want to reset all settings to their defaults? This cannot be undone.',
                    () => {
                        EditMateConfig.reset();
                        loadSettings();
                        UI.toast('Settings reset to defaults', 'success');
                    }
                );
            });
        }
    }

    function loadSettings() {
        const settings = EditMateConfig.getAll();

        // General
        setChecked('#setting-tooltips', settings.general.showTooltips);
        setChecked('#setting-confirm', settings.general.confirmDestructive);
        setChecked('#setting-autosave', settings.general.autoSaveSettings);

        // Services
        setChecked('#setting-python', settings.services.enablePythonService);
        setValue('#setting-python-port', settings.services.pythonServicePort);
        setValue('#setting-ffmpeg', settings.services.ffmpegPath);
        setValue('#setting-whisper-model', settings.captions.whisperModel);

        // B-Roll
        setValue('#setting-pexels-key', settings.broll.pexelsApiKey);
        setValue('#setting-pixabay-key', settings.broll.pixabayApiKey);

        // Captions
        setValue('#setting-caption-size', settings.captions.fontSize);
        setValue('#setting-caption-chars', settings.captions.maxCharsPerLine);
        setValue('#setting-caption-position', settings.captions.position);
    }

    function saveSettings() {
        EditMateConfig.set('general.showTooltips', getChecked('#setting-tooltips'));
        EditMateConfig.set('general.confirmDestructive', getChecked('#setting-confirm'));
        EditMateConfig.set('general.autoSaveSettings', getChecked('#setting-autosave'));

        EditMateConfig.set('services.enablePythonService', getChecked('#setting-python'));
        EditMateConfig.set('services.pythonServicePort', parseInt(getValue('#setting-python-port')) || 5588);
        EditMateConfig.set('services.ffmpegPath', getValue('#setting-ffmpeg'));
        EditMateConfig.set('captions.whisperModel', getValue('#setting-whisper-model'));

        EditMateConfig.set('broll.pexelsApiKey', getValue('#setting-pexels-key'));
        EditMateConfig.set('broll.pixabayApiKey', getValue('#setting-pixabay-key'));

        EditMateConfig.set('captions.fontSize', parseInt(getValue('#setting-caption-size')) || 48);
        EditMateConfig.set('captions.maxCharsPerLine', parseInt(getValue('#setting-caption-chars')) || 42);
        EditMateConfig.set('captions.position', getValue('#setting-caption-position'));

        EditMateConfig.save();
        UI.toast('Settings saved successfully!', 'success');
    }

    function setChecked(selector, value) {
        const el = UI.$(selector);
        if (el) el.checked = !!value;
    }

    function getChecked(selector) {
        const el = UI.$(selector);
        return el ? el.checked : false;
    }

    function setValue(selector, value) {
        const el = UI.$(selector);
        if (el) el.value = value || '';
    }

    function getValue(selector) {
        const el = UI.$(selector);
        return el ? el.value : '';
    }

    return { render, init };
})();

Router.register('settings', SettingsPage);
