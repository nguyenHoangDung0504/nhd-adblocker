(function () {
    const originalOpen = window.open;
    overrideAndLockWindowFn("open", function open(url, ...args) {
        try {
            const urlOrigin = new URL(url, location.href).origin;
            const currentOrigin = location.origin;

            if (urlOrigin !== currentOrigin)
                if (!confirm("Trang này muốn mở một tab mới: " + url)) return null;

            return originalOpen.call(window, url, ...args);
        } catch (e) {
            return null;
        }
    });

    const originalAssign = window.location.assign;
    window.location.assign = function (url) {
        const urlOrigin = new URL(url, location.href).origin;
        if (urlOrigin !== location.origin) {
            if (!confirm("Trang này muốn chuyển hướng đến: " + url)) return;
        }
        originalAssign.call(location, url);
    };
})();

/**
 * @param {{
 *      [K in keyof (typeof window)]: (typeof window)[K] extends (...args: any[]) => any ? K : never
 * }[keyof (typeof window)]} functionName
 */
function overrideAndLockWindowFn(functionName, overrideFunction) {
    Object.defineProperty(window, functionName, {
        value: overrideFunction,
        writable: false,
        configurable: false,
    });
}
