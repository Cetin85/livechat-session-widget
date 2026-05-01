/**
 * popup.js (v1.4.0)
 */
document.addEventListener("DOMContentLoaded", () => {
    const sessionText = document.getElementById("sessionText");
    const copyBtn = document.getElementById("copyBtn");
    const statusMsg = document.getElementById("statusMsg");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        const url = tabs[0].url;
        
        if (!url || !url.includes("my.livechatinc.com")) {
            statusMsg.innerHTML = '<span class="error">Please use on LiveChat archive pages.</span>';
            return;
        }

        const match = url.match(/\/(?:archives|chats)\/([A-Z0-9]+)/i);
        if (!match) {
            statusMsg.innerHTML = '<span class="error">No chat ID detected in URL.</span>';
            return;
        }

        const activeId = match[1];
        chrome.storage.local.get(null, (res) => {
            // Check storage for current ID or fallback to last captured
            const sid = res[activeId] || (res.lastSessionId && res.lastSessionId.includes(activeId) ? res.lastSessionId : null);
            
            if (sid) {
                sessionText.textContent = sid;
                copyBtn.disabled = false;
                statusMsg.innerHTML = '<span class="success">Session ID ready to copy!</span>';
            } else {
                statusMsg.innerHTML = "Session ID not found yet.<br>Try searching the Thread ID in Archives.";
            }
        });
    });

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(sessionText.textContent).then(() => {
            copyBtn.textContent = "Copied! ✨";
            copyBtn.style.background = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
            setTimeout(() => { window.close(); }, 800);
        });
    });
});

