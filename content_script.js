/**
 * content_script.js (v1.4.0)
 */

window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data || event.data.type !== "LIVECHAT_SESSION_DETECTED") return;

  const { chatId, sessionId } = event.data;

  try {
    chrome.storage.local.set({
      [chatId]: sessionId,
      "lastSessionId": sessionId,
      "lastChatId": chatId
    }, () => {
      injectUI();
    });
  } catch (e) { }
});

function getChatIdFromUrl() {
  const match = window.location.pathname.match(/\/(?:archives|chats)\/([A-Z0-9]+)/i);
  return match ? match[1] : null;
}

function createSessionIdUI(sessionId) {
  const container = document.createElement("div");
  container.id = "lc-custom-session-ui";
  container.style.cssText = `
    display: flex !important;
    flex-direction: column !important;
    margin: 16px 0 !important;
    padding: 1px !important;
    background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%) !important;
    border-radius: 12px !important;
    font-family: 'Inter', -apple-system, system-ui, sans-serif !important;
    box-shadow: 0 4px 15px rgba(88, 101, 242, 0.2) !important;
    overflow: hidden !important;
    z-index: 2147483647 !important;
    transition: all 0.3s ease !important;
  `;

  const inner = document.createElement("div");
  inner.style.cssText = `
    background: #ffffff !important;
    border-radius: 11px !important;
    padding: 12px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid #f1f5f9 !important;
    padding-bottom: 8px !important;
  `;

  const title = document.createElement("span");
  title.textContent = "SESSION ID";
  title.style.cssText = `
    font-size: 10px !important;
    letter-spacing: 0.1em !important;
    font-weight: 800 !important;
    color: #5865f2 !important;
    text-transform: uppercase !important;
  `;

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.style.cssText = `
    background: #5865f2 !important;
    color: white !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 4px 12px !important;
    cursor: pointer !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    transition: all 0.2s ease !important;
    outline: none !important;
  `;

  copyBtn.onmouseover = () => { copyBtn.style.background = "#4752c4"; };
  copyBtn.onmouseout = () => { copyBtn.style.background = "#5865f2"; };

  copyBtn.onclick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(sessionId).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copied! ✅";
      copyBtn.style.background = "#22c55e";
      setTimeout(() => { 
        copyBtn.textContent = originalText;
        copyBtn.style.background = "#5865f2";
      }, 2000);
    });
  };

  header.appendChild(title);
  header.appendChild(copyBtn);

  const valBox = document.createElement("div");
  valBox.textContent = sessionId;
  valBox.style.cssText = `
    font-family: 'Roboto Mono', monospace !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    background: #f8fafc !important;
    padding: 10px !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    text-align: center !important;
    color: #1e293b !important;
    word-break: break-all !important;
    cursor: pointer !important;
  `;
  
  valBox.onclick = () => copyBtn.click();

  inner.appendChild(header);
  inner.appendChild(valBox);
  container.appendChild(inner);
  return container;
}

function injectUI() {
  const activeChatId = getChatIdFromUrl();
  if (!activeChatId) return;

  const detailsContainer = document.querySelector('[data-testid="details-container"]');
  if (!detailsContainer) return;

  try {
    chrome.storage.local.get(null, (res) => {
      const sessionId = res[activeChatId] || (res.lastSessionId && res.lastSessionId.includes(activeChatId) ? res.lastSessionId : null);
      if (!sessionId) return;

      const existing = document.getElementById("lc-custom-session-ui");
      if (existing) {
        if (existing.innerText.includes(sessionId)) return;
        existing.remove();
      }

      let anchor = null;
      // Search for a good anchor point in the details container
      const potentialAnchors = detailsContainer.querySelectorAll('span, div');
      for (const el of potentialAnchors) {
        if (el.textContent.includes("Chatting time") || el.textContent.includes("Started on")) {
          anchor = el.closest('div');
          break;
        }
      }

      if (!anchor) anchor = detailsContainer.firstChild;
      if (anchor) anchor.insertAdjacentElement('afterend', createSessionIdUI(sessionId));
    });
  } catch (e) { }
}

const observer = new MutationObserver(() => injectUI());
function start() {
  if (!document.body) { setTimeout(start, 200); return; }
  observer.observe(document.body, { childList: true, subtree: true });
  injectUI();
}
start();
console.log("LiveChat Extension v1.4.0 Initialized");

