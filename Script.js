// ==UserScript==
// @name         Hide YouTube Shorts (Mobile)
// @version      1.1
// @description  Removes Shorts in Search results and on Home page
// @match        https://m.youtube.com/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- PART 1: CSS Injection for immediate hiding ---
    // This CSS is injected as early as possible to hide Shorts elements before they are even fully rendered.
    // It's faster than waiting for JavaScript and handles most cases.
    const css = `
        /* Hides the main Shorts tab/button in the navigation */
        [target-id="shorts-target"],

        /* Hides the entire Shorts player page if you accidentally navigate to it */
        [page-subtype="shorts"],

        /* Hides shelves/sections of Shorts on the homepage, search, and channel pages */
        ytm-reel-shelf-renderer,
        ytm-rich-section-renderer:has([href*="/shorts/"]),

        /* Hides individual Short videos in feeds and search results */
        ytm-video-with-context-renderer:has(a[href*="/shorts/"]),
        ytm-compact-video-renderer:has(a[href*="/shorts/"]),
        ytm-rich-item-renderer:has(a[href*="/shorts/"]),
        ytm-reel-item-renderer,

        /* Hides titles that say "Shorts" */
        div.shelf-title:has(span:contains("Shorts")),
        h2[aria-label*="Shorts"] {
            display: none !important;
        }
    `;

    // Create a <style> element and add our CSS to the document's <head>.
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

    // --- PART 2: JavaScript for dynamic content ---
    // YouTube loads content dynamically as you scroll and navigate.
    // A MutationObserver is needed to watch for these changes and remove any Shorts that the CSS might have missed.

    const hideShortsDynamically = () => {
        // Find any remaining elements that are containers for Shorts.
        // We look for links to /shorts/ and then remove their parent containers.
        document.querySelectorAll('a[href*="/shorts/"]').forEach(link => {
            // Find the main container for the video item. This list combines targets from both original scripts.
            const container = link.closest(`
                ytm-video-with-context-renderer,
                ytm-compact-video-renderer,
                ytm-rich-item-renderer,
                ytm-reel-item-renderer,
                ytm-reel-shelf-renderer,
                ytm-rich-section-renderer
            `);

            // If a container is found and it's not part of the main navigation/header, remove it.
            if (container && !container.closest('ytm-masthead, nav, header')) {
                container.remove();
            }
        });
    };

    // Create an observer that will run our function whenever the page content changes.
    // We use requestAnimationFrame to ensure our function runs efficiently without causing layout thrashing.
    const observer = new MutationObserver(() => {
        requestAnimationFrame(hideShortsDynamically);
    });

    // A function to initialize or re-initialize our script's logic.
    // We use a small timeout to ensure the page has had a moment to settle before we run the cleanup.
    let timeout;
    const init = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            hideShortsDynamically();
            // Start observing after the first run.
            observer.observe(document.body, { childList: true, subtree: true });
        }, 500);
    };

    // --- PART 3: Triggering the Script ---

    // Run the script on initial page load.
    init();

    // YouTube is a Single Page Application (SPA), so full page reloads don't happen when you navigate.
    // We must listen for YouTube's specific navigation event to re-run our cleanup logic.
    window.addEventListener('yt-navigate-finish', init);
})();
