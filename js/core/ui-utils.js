/**
 * EDITMATE PRO – UI Utilities
 * Helper functions for DOM manipulation, toasts, modals, etc.
 */

const UI = (() => {

    /**
     * Query a single element
     */
    function $(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    /**
     * Query all elements
     */
    function $$(selector, parent) {
        return Array.from((parent || document).querySelectorAll(selector));
    }

    /**
     * Create an HTML element with properties
     */
    function create(tag, props = {}, children = []) {
        const el = document.createElement(tag);
        
        if (props.className) el.className = props.className;
        if (props.id) el.id = props.id;
        if (props.textContent) el.textContent = props.textContent;
        if (props.innerHTML) el.innerHTML = props.innerHTML;
        if (props.title) el.title = props.title;
        
        if (props.dataset) {
            Object.entries(props.dataset).forEach(([k, v]) => el.dataset[k] = v);
        }
        if (props.style) {
            Object.entries(props.style).forEach(([k, v]) => el.style[k] = v);
        }
        if (props.attrs) {
            Object.entries(props.attrs).forEach(([k, v]) => el.setAttribute(k, v));
        }
        if (props.events) {
            Object.entries(props.events).forEach(([event, handler]) => {
                el.addEventListener(event, handler);
            });
        }

        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                el.appendChild(child);
            }
        });

        return el;
    }

    /**
     * Show a toast notification
     */
    function toast(message, type = 'info', duration = 3000) {
        const container = $('#toast-container');
        if (!container) return;

        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };

        const toastEl = create('div', { className: `toast ${type}` }, [
            create('span', { className: 'toast-icon', textContent: icons[type] || icons.info }),
            create('span', { className: 'toast-message', textContent: message }),
            create('button', {
                className: 'toast-close',
                textContent: '✕',
                events: { click: () => removeToast(toastEl) }
            })
        ]);

        container.appendChild(toastEl);

        if (duration > 0) {
            setTimeout(() => removeToast(toastEl), duration);
        }
    }

    function removeToast(el) {
        if (!el || !el.parentNode) return;
        el.style.animation = 'slideOutRight 200ms ease forwards';
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 200);
    }

    /**
     * Show a confirmation modal
     */
    function confirm(title, message, onConfirm, onCancel) {
        const overlay = $('#modal-overlay');
        const modalTitle = $('#modal-title');
        const modalBody = $('#modal-body');
        const modalFooter = $('#modal-footer');

        modalTitle.textContent = title;
        modalBody.innerHTML = `<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">${message}</p>`;
        
        modalFooter.innerHTML = '';
        modalFooter.appendChild(create('button', {
            className: 'btn btn-secondary',
            textContent: 'Cancel',
            events: {
                click: () => {
                    closeModal();
                    if (onCancel) onCancel();
                }
            }
        }));
        modalFooter.appendChild(create('button', {
            className: 'btn btn-primary',
            textContent: 'Confirm',
            events: {
                click: () => {
                    closeModal();
                    if (onConfirm) onConfirm();
                }
            }
        }));

        overlay.classList.remove('hidden');
    }

    function closeModal() {
        const overlay = $('#modal-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    /**
     * Set loading state on a button
     */
    function setButtonLoading(btn, loading, originalText) {
        if (loading) {
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
            btn.innerHTML = '<span class="spinner spinner-sm"></span> Working...';
        } else {
            btn.disabled = false;
            btn.textContent = originalText || btn.dataset.originalText || 'Done';
        }
    }

    /**
     * Create a tool action button with status badge
     */
    function createToolAction(config) {
        const { icon, name, description, status, onClick } = config;
        const isDisabled = status === 'planned' || status === 'blocked';

        const statusBadges = {
            implemented: '<span class="badge badge-success">Ready</span>',
            partial: '<span class="badge badge-warning">Partial</span>',
            planned: '<span class="badge badge-info">Planned</span>',
            blocked: '<span class="badge badge-error">Blocked</span>'
        };

        const btn = create('button', {
            className: `tool-action-btn${isDisabled ? ' disabled' : ''}`,
            events: isDisabled ? {} : { click: onClick || (() => {}) }
        });

        btn.innerHTML = `
            <span class="tool-action-icon">${icon}</span>
            <div class="tool-action-info">
                <div class="tool-action-name">${name}</div>
                <div class="tool-action-desc">${description}</div>
            </div>
            <div class="tool-action-status">${statusBadges[status] || ''}</div>
        `;

        return btn;
    }

    // Setup modal close
    function initModal() {
        const closeBtn = $('#modal-close');
        const overlay = $('#modal-overlay');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    return { $, $$, create, toast, confirm, closeModal, setButtonLoading, createToolAction, initModal };
})();
