/**
 * popup.js (v1.5.0)
 */
document.addEventListener("DOMContentLoaded", () => {
    const sessionText = document.getElementById("sessionText");
    const copyBtn = document.getElementById("copyBtn");
    const statusMsg = document.getElementById("statusMsg");
    const historyList = document.getElementById("historyList");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        const url = tabs[0].url;
        
        let activeId = null;
        if (url && url.includes("my.livechatinc.com")) {
            const match = url.match(/\/(?:archives|chats)\/([A-Z0-9]+)/i);
            if (match) activeId = match[1];
        }

        chrome.storage.local.get([...(activeId ? [activeId] : []), "lastSessionId"], (res) => {
            // Handle current ID
            if (activeId) {
                const sid = res[activeId] || (res.lastSessionId && res.lastSessionId.includes(activeId) ? res.lastSessionId : null);
                if (sid) {
                    sessionText.textContent = sid;
                    copyBtn.disabled = false;
                } else {
                    statusMsg.innerHTML = "Session ID not found yet.<br>Try searching the Thread ID in Archives.";
                }
            } else {
                statusMsg.innerHTML = '<span class="error">Please open a LiveChat archive page.</span>';
            }
        });
    });

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(sessionText.textContent).then(() => {
            copyBtn.textContent = "Copied! ✨";
            setTimeout(() => { window.close(); }, 800);
        });
    });
});


