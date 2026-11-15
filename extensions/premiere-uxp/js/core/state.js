/**
 * EDITMATE PRO – State Management
 * Simple reactive state management for the plugin UI
 */

const EditMateState = (() => {
    const state = {
        currentPage: 'home',
        sidebarCollapsed: false,
        projectInfo: null,
        isLoading: false,
        searchQuery: '',
        premiereConnected: false,
        pythonServiceConnected: false,
        activeOperations: []
    };

    const listeners = {};

    function get(key) {
        return state[key];
    }

    function set(key, value) {
        const oldValue = state[key];
        state[key] = value;
        notify(key, value, oldValue);
    }

    function on(key, callback) {
        if (!listeners[key]) listeners[key] = [];
        listeners[key].push(callback);
        return () => {
            listeners[key] = listeners[key].filter(cb => cb !== callback);
        };
    }

    function notify(key, newValue, oldValue) {
        if (listeners[key]) {
            listeners[key].forEach(cb => {
                try {
                    cb(newValue, oldValue);
                } catch (err) {
                    EditMateLogger.error('State', `Listener error for "${key}"`, err);
                }
            });
        }
    }

    function getAll() {
        return { ...state };
    }

    function addOperation(id, label) {
        state.activeOperations.push({ id, label, startTime: Date.now() });
        notify('activeOperations', state.activeOperations);
    }

    function removeOperation(id) {
        state.activeOperations = state.activeOperations.filter(op => op.id !== id);
        notify('activeOperations', state.activeOperations);
    }

    return { get, set, on, getAll, addOperation, removeOperation };
})();
