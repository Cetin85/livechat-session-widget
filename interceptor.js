/**
 * interceptor.js (v1.4.0)
 * MAIN world script.
 */
(function () {
    // Regex fallback for URL patterns
    const ID_PATTERN = /([A-Z]{2}[A-Z0-9]{6,})\/([A-Z]{2}[A-Z0-9]{6,})/g;

    function checkUrlForSession(urlStr) {
        if (!urlStr) return;
        const matches = [...urlStr.matchAll(ID_PATTERN)];
        for (const match of matches) {
            const prefix = match[1];
            const chatId = match[2];
            const sessionId = prefix + "-" + chatId;

            console.log("LiveChat Interceptor: URL Match Found ->", sessionId);

            window.postMessage({
                type: "LIVECHAT_SESSION_DETECTED",
                sessionId: sessionId,
                chatId: chatId
            }, "*");
        }
    }

    function processJsonResponse(data) {
        if (data && data.chats && Array.isArray(data.chats)) {
            data.chats.forEach(chat => {
                if (chat.id && chat.thread && chat.thread.id) {
                    const sessionId = chat.id + "-" + chat.thread.id;
                    console.log("LiveChat Interceptor: JSON Match Found ->", sessionId);
                    window.postMessage({
                        type: "LIVECHAT_SESSION_DETECTED",
                        sessionId: sessionId,
                        chatId: chat.thread.id // Use thread ID as key for archive lookup
                    }, "*");
                }
            });
        }
    }

    // Intercept XHR
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (url && typeof url.toString === 'function') {
            checkUrlForSession(url.toString());
        }

        this.addEventListener('load', function () {
            try {
                if (this.responseType === '' || this.responseType === 'text') {
                    if (this.responseText && this.responseText.includes('"chats"')) {
                        const data = JSON.parse(this.responseText);
                        processJsonResponse(data);
                    }
                }
            } catch (e) { }
        });

        return originalXhrOpen.apply(this, arguments);
    };

    // Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const resource = args[0];
        let urlStr = "";
        if (typeof resource === "string") urlStr = resource;
        else if (resource instanceof Request) urlStr = resource.url;
        else if (resource && resource.toString) urlStr = resource.toString();

        checkUrlForSession(urlStr);

        const response = await originalFetch.apply(this, args);
        
        // Clone response to read body without affecting original consumer
        const clone = response.clone();
        clone.json().then(data => {
            processJsonResponse(data);
        }).catch(() => {
            // Not JSON or error, ignore
        });

        return response;
    };
})();

