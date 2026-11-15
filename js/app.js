/**
 * EDITMATE PRO – Application Entry Point
 * Initializes all modules and starts the plugin
 */

(function initEditMatePro() {
    'use strict';

    EditMateLogger.info('App', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    EditMateLogger.info('App', '  EDITMATE PRO v1.0.0');
    EditMateLogger.info('App', '  Professional Editing Assistant');
    EditMateLogger.info('App', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 1. Load configuration
    EditMateConfig.load();
    EditMateLogger.info('App', 'Configuration loaded');

    // 2. Initialize Premiere Pro API
    const premiereAvailable = PremiereAPI.init();
    EditMateState.set('premiereConnected', premiereAvailable);
    
    if (premiereAvailable) {
        EditMateLogger.info('App', '✅ Premiere Pro API connected');
    } else {
        EditMateLogger.warn('App', '⚠️ Running outside Premiere Pro — API features disabled');
    }

    // 3. Initialize UI components
    UI.initModal();
    EditMateLogger.info('App', 'UI components initialized');

    // 4. Setup sidebar navigation
    setupSidebar();

    // 5. Setup search
    setupSearch();

    // 6. Navigate to home
    Router.navigate('home');

    // 7. Apply saved sidebar state
    const sidebarCollapsed = EditMateConfig.get('general.sidebarCollapsed');
    if (sidebarCollapsed) {
        const sidebar = UI.$('#sidebar');
        if (sidebar) sidebar.classList.add('collapsed');
        EditMateState.set('sidebarCollapsed', true);
    }

    EditMateLogger.info('App', '🚀 EDITMATE PRO initialized successfully');

    /**
     * Setup sidebar click handlers
     */
    function setupSidebar() {
        // Navigation items
        const navItems = UI.$$('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page) Router.navigate(page);
            });
        });

        // Sidebar toggle
        const toggleBtn = UI.$('#sidebar-toggle');
        const sidebar = UI.$('#sidebar');
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                const isCollapsed = sidebar.classList.contains('collapsed');
                EditMateState.set('sidebarCollapsed', isCollapsed);
                EditMateConfig.set('general.sidebarCollapsed', isCollapsed);
            });
        }

        EditMateLogger.debug('App', 'Sidebar navigation configured');
    }

    /**
     * Setup search functionality
     */
    function setupSearch() {
        const searchInput = UI.$('#search-input');
        if (!searchInput) return;

        const allTools = [
            { name: 'Remove Silence', page: 'cutting', keywords: 'silence remove cut trim' },
            { name: 'Detect Retakes', page: 'cutting', keywords: 'retake duplicate repeat' },
            { name: 'Filler Words', page: 'cutting', keywords: 'filler um uh like words' },
            { name: 'Close Gaps', page: 'cutting', keywords: 'gaps close ripple' },
            { name: 'Split Clips', page: 'cutting', keywords: 'split cut razor' },
            { name: 'Auto Captions', page: 'captions', keywords: 'captions subtitles transcribe text' },
            { name: 'Translate', page: 'captions', keywords: 'translate language' },
            { name: 'SRT Import', page: 'captions', keywords: 'srt import subtitles' },
            { name: 'SRT Export', page: 'captions', keywords: 'srt export subtitles' },
            { name: 'Find B-Roll', page: 'broll', keywords: 'broll stock footage pexels pixabay' },
            { name: 'Noise Reduction', page: 'audio', keywords: 'noise reduce clean audio' },
            { name: 'Voice Enhancement', page: 'audio', keywords: 'voice enhance clarity' },
            { name: 'Loudness', page: 'audio', keywords: 'loudness normalize lufs' },
            { name: 'Background Music', page: 'audio', keywords: 'music background ducking' },
            { name: 'Zoom In/Out', page: 'motion', keywords: 'zoom in out scale' },
            { name: 'Bounce', page: 'motion', keywords: 'bounce animation' },
            { name: 'Multicam Sync', page: 'multicam', keywords: 'multicam sync camera' },
            { name: 'YouTube Export', page: 'export', keywords: 'youtube export render' },
            { name: 'Reels Export', page: 'export', keywords: 'instagram reels export' },
            { name: 'Batch Export', page: 'export', keywords: 'batch export multiple' },
            { name: 'Macros', page: 'macros', keywords: 'macro workflow automate' },
            { name: 'Media Library', page: 'media', keywords: 'media library organize bins' },
            { name: 'Settings', page: 'settings', keywords: 'settings preferences config' }
        ];

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            EditMateState.set('searchQuery', query);

            if (query.length < 2) return;

            const matches = allTools.filter(tool => 
                tool.name.toLowerCase().includes(query) || 
                tool.keywords.includes(query)
            );

            if (matches.length === 1) {
                Router.navigate(matches[0].page);
                // Don't clear the search so user can see what they searched for
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.blur();
            }
        });
    }
})();
