/**
 * EDITMATE PRO – Router Module
 * Manages page navigation and rendering
 */

const Router = (() => {
    const pages = {};
    let currentPage = null;

    /**
     * Register a page module
     */
    function register(name, module) {
        pages[name] = module;
        EditMateLogger.debug('Router', `Page registered: ${name}`);
    }

    /**
     * Navigate to a page
     */
    function navigate(pageName) {
        if (!pages[pageName]) {
            EditMateLogger.warn('Router', `Page not found: ${pageName}`);
            UI.toast(`Page "${pageName}" not found`, 'warning');
            return;
        }

        // Cleanup current page
        if (currentPage && pages[currentPage] && pages[currentPage].cleanup) {
            try {
                pages[currentPage].cleanup();
            } catch (err) {
                EditMateLogger.error('Router', `Cleanup error for ${currentPage}`, err);
            }
        }

        currentPage = pageName;
        EditMateState.set('currentPage', pageName);

        // Update sidebar active state
        const navItems = UI.$$('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        // Render the page
        const container = UI.$('#page-container');
        if (!container) return;

        container.innerHTML = '';
        
        try {
            const pageContent = pages[pageName].render();
            if (typeof pageContent === 'string') {
                container.innerHTML = pageContent;
            } else if (pageContent instanceof HTMLElement) {
                container.appendChild(pageContent);
            }
            container.classList.add('page-enter');

            // Initialize page after render
            if (pages[pageName].init) {
                pages[pageName].init();
            }

            // Remove animation class after it plays
            setTimeout(() => container.classList.remove('page-enter'), 250);

        } catch (err) {
            EditMateLogger.error('Router', `Render error for ${pageName}`, err);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div class="empty-state-title">Failed to load page</div>
                    <div class="empty-state-desc">${err.message}</div>
                </div>
            `;
        }

        EditMateLogger.info('Router', `Navigated to: ${pageName}`);
    }

    /**
     * Get current page name
     */
    function getCurrentPage() {
        return currentPage;
    }

    /**
     * Get all registered page names
     */
    function getPages() {
        return Object.keys(pages);
    }

    return { register, navigate, getCurrentPage, getPages };
})();
