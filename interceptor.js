/**
 * interceptor.js (v1.3.3)
 * MAIN world script.
 */
(function () {
    // Regex updated to allow TB, TC, or any 2-letter prefix + 8+ characters
    const ID_PATTERN = /([A-Z]{2}[A-Z0-9]{6,})\/([A-Z]{2}[A-Z0-9]{6,})/g;

    function checkUrlForSession(urlStr) {
        if (!urlStr) return;
        const matches = [...urlStr.matchAll(ID_PATTERN)];
        for (const match of matches) {
            const prefix = match[1];
            const chatId = match[2];
            const sessionId = prefix + "-" + chatId;

            console.log("LiveChat Interceptor: Match Found ->", sessionId);

            window.postMessage({
                type: "LIVECHAT_SESSION_DETECTED",
                sessionId: sessionId,
                chatId: chatId
            }, "*");
        }
    }

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (url && typeof url.toString === 'function') {
            checkUrlForSession(url.toString());
        }
        return originalXhrOpen.apply(this, arguments);
    };

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const resource = args[0];
        let urlStr = "";
        if (typeof resource === "string") urlStr = resource;
        else if (resource instanceof Request) urlStr = resource.url;
        else if (resource && resource.toString) urlStr = resource.toString();

        checkUrlForSession(urlStr);
        return originalFetch.apply(this, args);
    };
})();
