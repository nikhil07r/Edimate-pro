/**
 * EDITMATE PRO – Logger Module
 * Centralized logging with levels and optional UI display
 */

const EditMateLogger = (() => {
    const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    let currentLevel = LOG_LEVELS.DEBUG;
    const logs = [];
    const MAX_LOGS = 500;

    function timestamp() {
        return new Date().toISOString().slice(11, 23);
    }

    function log(level, tag, message, data) {
        if (LOG_LEVELS[level] < currentLevel) return;

        const entry = {
            time: timestamp(),
            level,
            tag,
            message,
            data: data || null
        };

        logs.push(entry);
        if (logs.length > MAX_LOGS) logs.shift();

        const prefix = `[EditMate ${level}] [${tag}]`;
        switch (level) {
            case 'DEBUG': console.log(prefix, message, data || ''); break;
            case 'INFO':  console.info(prefix, message, data || ''); break;
            case 'WARN':  console.warn(prefix, message, data || ''); break;
            case 'ERROR': console.error(prefix, message, data || ''); break;
        }

        return entry;
    }

    return {
        debug: (tag, msg, data) => log('DEBUG', tag, msg, data),
        info:  (tag, msg, data) => log('INFO', tag, msg, data),
        warn:  (tag, msg, data) => log('WARN', tag, msg, data),
        error: (tag, msg, data) => log('ERROR', tag, msg, data),
        setLevel: (level) => { currentLevel = LOG_LEVELS[level] || 0; },
        getLogs: () => [...logs],
        clear: () => { logs.length = 0; }
    };
})();
