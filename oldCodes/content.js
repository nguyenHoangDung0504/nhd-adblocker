const selectorsToRemove = format(`
    .realMHContainer.magneticMh.canClose

    .ad
    .exo_wrapper
    .flex.justify-center.mb-4>iframe
    .flex.justify-center.mt-6>iframe

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

const removalInterval = setInterval(() => {
    removeElements();
    elapsedTime += intervalTime;

    if (elapsedTime >= minimumRunTime) {
        console.log("Maximum runtime reached. Stop removing.");
        console.log("All script src in this page:", [...document.querySelectorAll('script[src]')].map(s => s.src));
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

    // Tìm tất cả các liên kết có target="_blank" và kiểm tra origin
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const linkOrigin = new URL(link.href).origin;
            const currentOrigin = window.location.origin;

            if (linkOrigin !== currentOrigin) {
                const userConfirmed = confirm(`Trang web này muốn mở liên kết bên ngoài: ${link.href}. Bạn có muốn mở không?`);
                if (!userConfirmed) {
                    e.preventDefault(); // Chặn nếu người dùng không xác nhận
                }
            }
        });
    });

    // Ghi đè iframe mở tab mới và kiểm tra origin
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        iframe.onload = function () {
            try {
                const iframeWindowOpen = iframe.contentWindow.open;
                iframe.contentWindow.open = function (url, ...args) {
                    const iframeOrigin = new URL(url).origin;
                    const currentOrigin = window.location.origin;

                    if (iframeOrigin !== currentOrigin) {
                        const userConfirmed = confirm(`Iframe này muốn mở một tab mới: ${url}. Bạn có muốn mở không?`);
                        if (userConfirmed) {
                            return iframeWindowOpen.call(window, url, ...args);
                        }
                        return null;
                    }
                };
            } catch (e) {
                console.log(iframe);
                console.log('Không thể truy cập iframe cross-origin.');
            }
        };
    });
}

function observeClicks() {
    document.addEventListener('click', (e) => {
        const target = e.target;

        if (target.tagName.toLowerCase() === 'a' && target.href) {
            const anchorOrigin = new URL(target.href).origin;
            const currentOrigin = window.location.origin;

            // Chỉ yêu cầu xác nhận nếu origin khác với trang hiện tại
            if (anchorOrigin !== currentOrigin && !target.href.includes('javascript')) {
                const userConfirmed = confirm(`Trang web này muốn mở liên kết bên ngoài: ${target.href}. Bạn có muốn mở không?`);
                if (!userConfirmed) {
                    e.preventDefault(); // Chặn hành động click nếu không xác nhận
                }
            }
        }
    }, true);  // Sử dụng capture để bắt sự kiện trước khi thực hiện chuyển hướng
}

function observePopups() {
    const currentOrigin = window.location.origin;

    // Ghi đè window.open và kiểm tra origin
    const originalWindowOpen = window.open;
    window.open = function (url, ...args) {
        const urlOrigin = new URL(url).origin;

        if (urlOrigin !== currentOrigin) {
            const userConfirmed = confirm(`Trang web này muốn mở một tab mới: ${url}. Bạn có muốn mở không?`);
            if (userConfirmed) {
                return originalWindowOpen.call(window, url, ...args);
            }
            return null;
        } else {
            return originalWindowOpen.call(window, url, ...args);
        }
    };

    // Ghi đè window.location.assign và kiểm tra origin
    const originalLocationAssign = window.location.assign;
    window.location.assign = function (url) {
        const urlOrigin = new URL(url).origin;

        if (urlOrigin !== currentOrigin) {
            const userConfirmed = confirm(`Trang web này muốn chuyển hướng đến một trang bên ngoài: ${url}. Bạn có muốn chuyển không?`);
            if (userConfirmed) {
                originalLocationAssign.call(window.location, url);
            }
        } else {
            originalLocationAssign.call(window.location, url);
        }
    };

    // Ghi đè pushState và replaceState để kiểm tra origin
    const originalPushState = history.pushState;
    history.pushState = function (state, title, url) {
        const urlOrigin = new URL(url, window.location.href).origin;

        if (urlOrigin !== currentOrigin) {
            const userConfirmed = confirm(`Trang web này muốn thay đổi lịch sử đến một URL bên ngoài: ${url}. Bạn có muốn tiếp tục không?`);
            if (userConfirmed) {
                return originalPushState.apply(history, arguments);
            }
        } else {
            return originalPushState.apply(history, arguments);
        }
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (state, title, url) {
        const urlOrigin = new URL(url, window.location.href).origin;

        if (urlOrigin !== currentOrigin) {
            const userConfirmed = confirm(`Trang web này muốn thay đổi lịch sử đến một URL bên ngoài: ${url}. Bạn có muốn tiếp tục không?`);
            if (userConfirmed) {
                return originalReplaceState.apply(history, arguments);
            }
        } else {
            return originalReplaceState.apply(history, arguments);
        }
    };

    // Ghi đè postMessage để kiểm tra origin nếu URL liên quan đến mở tab
    const originalPostMessage = window.postMessage;
    window.postMessage = function (message, targetOrigin, ...args) {
        const messageOrigin = new URL(targetOrigin, window.location.href).origin;

        if (messageOrigin !== currentOrigin) {
            const userConfirmed = confirm(`Trang web này muốn mở tab mới qua postMessage. Bạn có muốn tiếp tục không?`);
            if (!userConfirmed) {
                return;
            }
        }
        return originalPostMessage.apply(window, [message, targetOrigin, ...args]);
    };
}

observePopups();