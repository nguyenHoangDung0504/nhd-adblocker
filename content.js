// Note: đã sửa "run_at": "document_start" trong manifest

(function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('block-popup.js');
    script.type = 'text/javascript';
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
})();

// ==== Chặn click vào liên kết nguy hiểm ====
document.addEventListener('click', (e) => {
    if (!e.isTrusted) {
        e.preventDefault();
        return
    }
    const target = e.target;
    if (target.tagName?.toLowerCase() === 'a' && target.href) {
        const hrefOrigin = new URL(target.href, location.href).origin;
        if (hrefOrigin !== location.origin && !target.href.startsWith('javascript')) {
            if (!confirm('Trang này muốn mở liên kết ngoài: ' + target.href)) {
                e.preventDefault();
            }
        }
    }
}, true);

// ==== Danh sách selector để xóa quảng cáo ====
const selectorsToRemove = `
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
`.trim().split('\n').map(s => s.trim()).filter(Boolean);

// ==== Hàm xóa quảng cáo định kỳ ====
function removeAds() {
    selectorsToRemove.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
    });
}

// ==== Phát hiện các phần tử khả nghi dựa vào từ khóa ====
function detectPotentialAds() {
    const keywords = ["ads", "sponsor", "banner", "promote"];
    const potential = new Set();

    keywords.forEach(keyword => {
        document.querySelectorAll(`[class*="${keyword}"], [id*="${keyword}"]`)
            .forEach(el => potential.add(el));
    });

    if (potential.size > 0) {
        console.log("Phát hiện các phần tử nghi là quảng cáo:", [...potential]);
    }
}

// ==== Ghi log script để debug ====
function logScriptSources() {
    const currentOrigin = location.origin;
    const scripts = [...document.querySelectorAll('script[src]')].map(s => s.src);
    const same = scripts.filter(src => new URL(src).origin === currentOrigin);
    const diff = scripts.filter(src => new URL(src).origin !== currentOrigin);
    console.log('Script cùng origin:', same);
    console.log('Script khác origin:', diff);
}

// ==== Thực thi khi DOM đã sẵn sàng ====
function run() {
    let elapsed = 0;
    const interval = 250;
    const maxTime = 5000;

    const cleaner = setInterval(() => {
        removeAds();
        elapsed += interval;
        if (elapsed >= maxTime) {
            clearInterval(cleaner);
            logScriptSources();
            detectPotentialAds();
        }
    }, interval);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
} else {
    run();
}
