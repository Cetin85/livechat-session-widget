/**
 * popup.js (v1.3.3)
 */
document.addEventListener("DOMContentLoaded", () => {
    const sessionText = document.getElementById("sessionText");
    const copyBtn = document.getElementById("copyBtn");
    const statusMsg = document.getElementById("statusMsg");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        const url = tabs[0].url;
        if (!url || !url.includes("my.livechatinc.com")) {
            statusMsg.textContent = "Please use on LiveChat archive pages.";
            return;
        }

        const match = url.match(/\/(?:archives|chats)\/([A-Z0-9]+)/i);
        if (!match) {
            statusMsg.textContent = "No chat ID detected in URL.";
            return;
        }

        const chatId = match[1];
        chrome.storage.local.get(null, (res) => {
            const sid = res[chatId] || (res.lastSessionId && res.lastSessionId.includes(chatId) ? res.lastSessionId : null);
            if (sid) {
                sessionText.textContent = sid;
                copyBtn.disabled = false;
            } else {
                statusMsg.innerHTML = "Session ID not found.<br>Try refreshing the page (F5) and checking again.";
            }
        });
    });

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(sessionText.textContent).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => { window.close(); }, 1000);
        });
    });
});
