/**
 * EDITMATE PRO – Configuration Module
 * Manages plugin settings and preferences
 */

const EditMateConfig = (() => {
    const STORAGE_KEY = 'editmatepro_settings';

    const defaults = {
        general: {
            theme: 'dark',
            sidebarCollapsed: false,
            language: 'en',
            showTooltips: true,
            confirmDestructive: true,
            autoSaveSettings: true
        },
        cutting: {
            silenceThreshold: -35,
            silenceDuration: 0.5,
            gapPadding: 0.1,
            fillerWords: ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally']
        },
        captions: {
            fontSize: 48,
            fontFamily: 'Arial',
            position: 'bottom',
            backgroundColor: 'rgba(0,0,0,0.7)',
            textColor: '#FFFFFF',
            highlightColor: '#00D9FF',
            maxCharsPerLine: 42,
            whisperModel: 'base'
        },
        audio: {
            targetLoudness: -14,
            noiseReductionStrength: 0.5,
            duckingLevel: -18,
            duckingFade: 0.3
        },
        export: {
            defaultFormat: 'H.264',
            youtubePreset: '1080p',
            reelsPreset: '1080x1920'
        },
        broll: {
            defaultDuration: 3,
            pexelsApiKey: '',
            pixabayApiKey: '',
            searchSafeMode: true
        },
        services: {
            pythonServicePort: 5588,
            pythonServiceHost: '127.0.0.1',
            enablePythonService: false,
            ffmpegPath: ''
        }
    };

    let settings = JSON.parse(JSON.stringify(defaults));

    function load() {
        try {
            // In UXP, we use localStorage
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                settings = deepMerge(defaults, parsed);
                EditMateLogger.info('Config', 'Settings loaded successfully');
            } else {
                EditMateLogger.info('Config', 'Using default settings');
            }
        } catch (err) {
            EditMateLogger.error('Config', 'Failed to load settings', err);
            settings = JSON.parse(JSON.stringify(defaults));
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            EditMateLogger.info('Config', 'Settings saved');
        } catch (err) {
            EditMateLogger.error('Config', 'Failed to save settings', err);
        }
    }

    function get(path) {
        const keys = path.split('.');
        let value = settings;
        for (const key of keys) {
            if (value === undefined || value === null) return undefined;
            value = value[key];
        }
        return value;
    }

    function set(path, value) {
        const keys = path.split('.');
        let target = settings;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in target)) target[keys[i]] = {};
            target = target[keys[i]];
        }
        target[keys[keys.length - 1]] = value;
        if (settings.general.autoSaveSettings) save();
    }

    function reset() {
        settings = JSON.parse(JSON.stringify(defaults));
        save();
        EditMateLogger.info('Config', 'Settings reset to defaults');
    }

    function getAll() {
        return JSON.parse(JSON.stringify(settings));
    }

    function getDefaults() {
        return JSON.parse(JSON.stringify(defaults));
    }

    function deepMerge(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    return { load, save, get, set, reset, getAll, getDefaults };
})();
