/**
 * EDITMATE PRO – B-Roll Page
 */

const BRollPage = (() => {
    function render() {
        const page = UI.create('div', { className: 'tool-page' });

        page.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">🎬 B-Roll Finder</h2>
                <p class="page-subtitle">Search and place stock footage automatically</p>
            </div>

            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">🔍 Search Stock Footage</span>
                </div>
                <div class="form-group">
                    <label class="form-label">Search Query</label>
                    <input type="text" class="form-input" id="broll-search" placeholder="Search Pexels & Pixabay...">
                </div>
                <div class="form-group">
                    <label class="form-label">Clip Duration (seconds)</label>
                    <input type="range" class="range-slider" id="broll-duration" min="1" max="15" value="3">
                    <span id="broll-duration-label" style="color: var(--text-secondary); font-size: var(--font-size-xs);">3s</span>
                </div>
                <button class="btn btn-primary" id="broll-search-btn" disabled>
                    🔍 Search (API key required)
                </button>
                <div id="broll-results" style="margin-top: var(--space-lg);"></div>
            </div>

            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">🤖 Smart B-Roll</span>
                </div>
                <div class="tool-actions-list" id="smart-broll-tools"></div>
            </div>
        `;

        return page;
    }

    function init() {
        // Duration slider
        const slider = UI.$('#broll-duration');
        const label = UI.$('#broll-duration-label');
        if (slider && label) {
            slider.addEventListener('input', () => {
                label.textContent = slider.value + 's';
            });
        }

        // Search button state
        const searchBtn = UI.$('#broll-search-btn');
        const pexelsKey = EditMateConfig.get('broll.pexelsApiKey');
        if (searchBtn && pexelsKey) {
            searchBtn.disabled = false;
            searchBtn.textContent = '🔍 Search';
        }

        // Smart tools
        const smartContainer = UI.$('#smart-broll-tools');
        if (smartContainer) {
            const tools = [
                { icon: '🔗', name: 'Match to Speech', description: 'Automatically match B-roll to spoken words', status: 'planned' },
                { icon: '📍', name: 'Auto Place', description: 'Place B-roll clips on the timeline automatically', status: 'planned' },
                { icon: '📂', name: 'Search Local', description: 'Search your local footage library', status: 'planned' },
                { icon: '👁️', name: 'Preview', description: 'Preview footage before placing', status: 'planned' }
            ];
            tools.forEach(t => smartContainer.appendChild(UI.createToolAction(t)));
        }
    }

    return { render, init };
})();

Router.register('broll', BRollPage);
