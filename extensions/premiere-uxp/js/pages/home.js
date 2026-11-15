/**
 * EDITMATE PRO – Home Dashboard Page
 */

const HomePage = (() => {
    function render() {
        const page = UI.create('div', { className: 'tool-page' });

        // Welcome Banner
        page.innerHTML = `
            <div class="dashboard-welcome">
                <div class="welcome-content">
                    <h1 class="welcome-title">Welcome to <span class="welcome-accent">EDITMATE PRO</span></h1>
                    <p class="welcome-description">Your all-in-one editing assistant for Adobe Premiere Pro. Select a tool from the sidebar to get started.</p>
                </div>
            </div>

            <div class="stats-row" id="stats-row">
                <div class="stat-card">
                    <div class="stat-value" id="stat-premiere">—</div>
                    <div class="stat-label">Premiere</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="stat-sequence">—</div>
                    <div class="stat-label">Sequence</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="stat-tools">12</div>
                    <div class="stat-label">Tool Modules</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="stat-service">—</div>
                    <div class="stat-label">AI Service</div>
                </div>
            </div>

            <div class="tools-section-title">⚡ Quick Actions</div>
            <div class="tools-grid" id="quick-tools-grid"></div>

            <div class="tools-section-title">🧰 All Tool Modules</div>
            <div class="tools-grid" id="all-tools-grid"></div>
        `;

        return page;
    }

    function init() {
        renderQuickTools();
        renderAllTools();
        updateStats();
    }

    function renderQuickTools() {
        const grid = UI.$('#quick-tools-grid');
        if (!grid) return;

        const quickTools = [
            { icon: '💬', name: 'Auto Captions', desc: 'Whisper AI subtitle studio', page: 'captions', status: 'implemented' },
            { icon: '✂️', name: 'Remove Silence', desc: 'Auto-detect and cut silent segments', page: 'cutting', status: 'planned' },
            { icon: '🔊', name: 'Audio Cleanup', desc: 'Remove noise & normalize audio', page: 'audio', status: 'planned' },
            { icon: '🎬', name: 'Find B-Roll', desc: 'Search stock footage online', page: 'broll', status: 'planned' },
            { icon: '📤', name: 'Quick Export', desc: 'Export for YouTube or Reels', page: 'export', status: 'planned' },
            { icon: '⚙️', name: 'Run Macro', desc: 'One-click editing workflow', page: 'macros', status: 'planned' }
        ];

        quickTools.forEach(tool => {
            const card = UI.create('div', {
                className: `tool-card${tool.status === 'planned' ? ' coming-soon' : ''}`,
                events: {
                    click: () => {
                        if (tool.status !== 'planned') {
                            Router.navigate(tool.page);
                        } else {
                            UI.toast(`${tool.name} is coming soon!`, 'info');
                        }
                    }
                }
            });

            card.innerHTML = `
                <span class="tool-card-icon">${tool.icon}</span>
                <div class="tool-card-name">${tool.name}</div>
                <div class="tool-card-desc">${tool.desc}</div>
                ${tool.status === 'planned' ? '<span class="coming-soon-badge">Coming Soon</span>' : ''}
            `;

            grid.appendChild(card);
        });
    }

    function renderAllTools() {
        const grid = UI.$('#all-tools-grid');
        if (!grid) return;

        const allTools = [
            { icon: '✂️', name: 'Cutting', desc: 'Timeline editing tools', page: 'cutting' },
            { icon: '💬', name: 'Captions', desc: 'Subtitles & transcription', page: 'captions' },
            { icon: '🎬', name: 'B-Roll', desc: 'Stock footage search', page: 'broll' },
            { icon: '🔊', name: 'Audio', desc: 'Audio processing', page: 'audio' },
            { icon: '🎯', name: 'Motion', desc: 'Animations & presets', page: 'motion' },
            { icon: '📹', name: 'Multicam', desc: 'Multi-camera editing', page: 'multicam' },
            { icon: '✨', name: 'Effects', desc: 'Visual effects', page: 'effects' },
            { icon: '⚙️', name: 'Macros', desc: 'Automated workflows', page: 'macros' },
            { icon: '📤', name: 'Export', desc: 'Batch export presets', page: 'export' },
            { icon: '📁', name: 'Media Library', desc: 'Asset management', page: 'media' },
            { icon: '⚙️', name: 'Settings', desc: 'Plugin configuration', page: 'settings' }
        ];

        allTools.forEach(tool => {
            const card = UI.create('div', {
                className: 'tool-card',
                events: { click: () => Router.navigate(tool.page) }
            });

            card.innerHTML = `
                <span class="tool-card-icon">${tool.icon}</span>
                <div class="tool-card-name">${tool.name}</div>
                <div class="tool-card-desc">${tool.desc}</div>
            `;

            grid.appendChild(card);
        });
    }

    async function updateStats() {
        const premiereEl = UI.$('#stat-premiere');
        const sequenceEl = UI.$('#stat-sequence');
        const serviceEl = UI.$('#stat-service');

        if (PremiereAPI.isAvailable()) {
            if (premiereEl) premiereEl.textContent = '🟢';
            const info = await PremiereAPI.getProjectInfo();
            if (sequenceEl) sequenceEl.textContent = info.hasActiveSequence ? '🟢' : '🔴';
        } else {
            if (premiereEl) premiereEl.textContent = '🔴';
            if (sequenceEl) sequenceEl.textContent = '—';
        }

        // Live Whisper service check
        try {
            const res = await fetch('http://127.0.0.1:5588/health');
            if (res.ok) {
                if (serviceEl) serviceEl.textContent = '🟢 Online';
                EditMateState.set('pythonServiceConnected', true);
            } else {
                if (serviceEl) serviceEl.textContent = '🔴 Offline';
                EditMateState.set('pythonServiceConnected', false);
            }
        } catch (e) {
            if (serviceEl) serviceEl.textContent = '🔴 Offline';
            EditMateState.set('pythonServiceConnected', false);
        }
    }

    return { render, init };
})();

// Register with router
Router.register('home', HomePage);
