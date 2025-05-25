// ==UserScript==
// @name         Hide YouTube Shorts (Mobile)
// @version      1.0
// @description  Removes Shorts in Search results and on Home page
// ==/UserScript==

(() => {
    'use strict';
    
    const css = `
        [is-shorts], [href*="/shorts/"], .shorts-avatar,
        ytm-reel-shelf-renderer, ytm-reel-item-renderer,
        [href*="/shorts/"] + .metadata, ytm-reel-item-renderer ytm-channel-name,
        [href*="/shorts/"] ~ ytm-video-meta-block, a[href*="/shorts/"] .avatar-container,
        div.shelf-title:has(span:contains("Shorts")), h2[aria-label*="Shorts"],
        ytm-rich-section-renderer:has([href*="/shorts/"]),
        ytm-rich-item-renderer:has([href*="/shorts/"]),
        [page-subtype="shorts"], [target-id="shorts-target"] {
            display: none !important;
        }`;
    
    document.head.appendChild(Object.assign(document.createElement('style'), {textContent: css}));

    const observer = new MutationObserver(() => requestAnimationFrame(clean));
    const protect = 'ytm-masthead, ytm-player, ytm-searchbox';
    
    function clean() {
        document.querySelectorAll(`
            [href*="/shorts/"], [is-shorts], [page-subtype="shorts"],
            ytm-reel-item-renderer, ytm-rich-item-renderer:has([href*="/shorts/"])
        `).forEach(el => {
            const containers = [
                el.closest('ytm-reel-shelf-renderer, ytm-rich-section-renderer'),
                el.closest('ytm-rich-item-renderer, ytm-video-with-context-renderer'),
                el.closest('ytm-compact-video-renderer, ytm-reel-item-renderer')
            ];
            
            containers.forEach(container => {
                if(container && !container.closest(protect)) {
                    container.remove();
                }
            });
        });
    }
  
    let timeout;
    function init() {
        clearTimeout(timeout);
        timeout = setTimeout(clean, 500);
    }
    
    init();
    observer.observe(document.body, {childList: true, subtree: true});
    window.addEventListener('yt-navigate-finish', init);
})();
