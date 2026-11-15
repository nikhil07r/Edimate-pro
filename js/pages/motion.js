/**
 * EDITMATE PRO – Motion & Animation Page
 */

const MotionPage = (() => {
    function render() {
        const page = UI.create('div', { className: 'tool-page' });

        page.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">🎯 Motion & Animation</h2>
                <p class="page-subtitle">Keyframe animation presets and motion effects</p>
            </div>

            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">🔄 Motion Presets</span>
                </div>
                <div class="tool-actions-list" id="motion-preset-tools"></div>
            </div>

            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">📐 Keyframes</span>
                </div>
                <div class="tool-actions-list" id="keyframe-tools"></div>
            </div>

            <div class="section-card">
                <div class="section-card-header">
                    <span class="section-card-title">🎛️ Layers & Guides</span>
                </div>
                <div class="tool-actions-list" id="layer-tools"></div>
            </div>
        `;

        return page;
    }

    function init() {
        const presetContainer = UI.$('#motion-preset-tools');
        if (presetContainer) {
            const tools = [
                { icon: '🔍', name: 'Zoom In/Out', description: 'Smooth zoom animation on clips', status: 'planned' },
                { icon: '🏀', name: 'Bounce', description: 'Bouncing animation effect', status: 'planned' },
                { icon: '🧲', name: 'Elastic', description: 'Elastic easing motion', status: 'planned' },
                { icon: '🌀', name: 'Spring', description: 'Spring physics animation', status: 'planned' }
            ];
            tools.forEach(t => presetContainer.appendChild(UI.createToolAction(t)));
        }

        const keyframeContainer = UI.$('#keyframe-tools');
        if (keyframeContainer) {
            const tools = [
                { icon: '📈', name: 'Keyframe Easing', description: 'Apply easing curves to selected keyframes', status: 'planned' },
                { icon: '📉', name: 'Custom Curves', description: 'Draw custom animation curves', status: 'planned' }
            ];
            tools.forEach(t => keyframeContainer.appendChild(UI.createToolAction(t)));
        }

        const layerContainer = UI.$('#layer-tools');
        if (layerContainer) {
            const tools = [
                { icon: '🎚️', name: 'Adjustment Layers', description: 'Create and manage adjustment layers', status: 'planned' },
                { icon: '🔀', name: 'Blend Modes', description: 'Quick blend mode selector', status: 'planned' },
                { icon: '📏', name: 'Safe Zones', description: 'Toggle safe-zone guides overlay', status: 'planned' }
            ];
            tools.forEach(t => layerContainer.appendChild(UI.createToolAction(t)));
        }
    }

    return { render, init };
})();

Router.register('motion', MotionPage);
