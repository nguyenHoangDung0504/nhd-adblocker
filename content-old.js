const selectorsToRemove = format(`
    .realMHContainer.magneticMh.canClose

    .ad
    .exo_wrapper
    .flex.justify-center.mb-4>iframe
    .flex.justify-center.mt-6>iframe
    .adsbyexoclick

    .root--ujvuu.slideAnimation--K36g6
    .ablocktop

    .ads-abc
    #custom_html-2.widget_text

    .qx_main

    .code-block.code-block-2
    .exo-native-widget-outer-container

    #popup-truyenqq
    #ad_info_top
    #ad_info
    .ads-banner
    .ad_info

    #qxx
`);

const intervalTime = 250;
const minimumRunTime = 5000;
let elapsedTime = 0;

/**
 * @param {string} str 
 * @returns {string[]}
 */
function format(str) {
    return str.trim()
        .split('\n')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('//'));
}

function removeElements() {
    selectorsToRemove.forEach(selector => {
        if (!selector) return;
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`Found element(s) with selector: ${selector}. Removing...`);
            elements.forEach(element => element.remove());
        }
    });
}

// Function to categorize and log script URLs
function logScriptUrls() {
    const currentOrigin = window.location.origin;
    const scriptUrls = [...document.querySelectorAll('script[src]')].map(s => s.src);

    const sameOriginScripts = scriptUrls.filter(url => new URL(url).origin === currentOrigin);
    const differentOriginScripts = scriptUrls.filter(url => new URL(url).origin !== currentOrigin);

    console.log("Same-origin scripts:", sameOriginScripts);
    console.log("Different-origin scripts:", differentOriginScripts);
}

// Query elements that might be ads based on keywords
function detectPotentialAds() {
    const keywords = ["ads", "sponsor", "banner", "promote"];
    const potentialAds = [];

    keywords.forEach(keyword => {
        const elements = document.querySelectorAll(`[class*="${keyword}"], [id*="${keyword}"]`);
        elements.forEach(element => {
            if (!potentialAds.includes(element)) {
                potentialAds.push(element);
            }
        });
    });

    if (potentialAds.length > 0) {
        console.log("Potential ad elements detected:", potentialAds);
    }
}

const removalInterval = setInterval(() => {
    removeElements();
    elapsedTime += intervalTime;

    if (elapsedTime >= minimumRunTime) {
        console.log("Maximum runtime reached. Stop removing.");
        logScriptUrls();
        detectPotentialAds();
        clearInterval(removalInterval);
    }
}, intervalTime);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        run();
    });
} else {
    run();
}

function run() {
    console.log("Page loaded. Starting removal process.");
    removeElements();
    observeClicks();
    observePopups();
}

// Modified observeClicks function to monitor external links and prevent bypassing
function observeClicks() {
    document.addEventListener('click', (e) => {
        if (!e.isTrusted) return;
        const target = e.target;

        if (target.tagName.toLowerCase() === 'a' && target.href) {
            const anchorOrigin = new URL(target.href).origin;
            const currentOrigin = window.location.origin;

            // Only ask for confirmation if origin differs from the current page
            if (anchorOrigin !== currentOrigin && !target.href.includes('javascript')) {
                const userConfirmed = confirm(`This site wants to open an external link: ${target.href}. Do you want to proceed?`);
                if (!userConfirmed) {
                    e.preventDefault(); // Block the click action if not confirmed
                }
            }
        }
    }, true);
}

function observePopups() {
    const currentOrigin = window.location.origin;

    const originalWindowOpen = window.open;
    Object.defineProperty(window, 'open', {
        value: function (url, ...args) {
            const urlOrigin = new URL(url).origin;

            if (urlOrigin !== currentOrigin) {
                const userConfirmed = confirm(`This site wants to open a new tab: ${url}. Do you want to proceed?`);
                if (userConfirmed) {
                    return originalWindowOpen.call(window, url, ...args);
                }
                return null;
            } else {
                return originalWindowOpen.call(window, url, ...args);
            }
        },
        writable: false, // Ngăn không cho ghi đè lại
        configurable: false // Ngăn cấu hình lại
    });

    // Override window.location.assign to check origin
    const originalLocationAssign = window.location.assign;
    window.location.assign = function (url) {
        const urlOrigin = new URL(url).origin;

        if (urlOrigin !== currentOrigin) {
            const userConfirmed = confirm(`This site wants to redirect to an external page: ${url}. Do you want to proceed?`);
            if (userConfirmed) {
                originalLocationAssign.call(window.location, url);
            }
        } else {
            originalLocationAssign.call(window.location, url);
        }
    };
}