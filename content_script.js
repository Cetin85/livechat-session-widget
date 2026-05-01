/**
 * content_script.js (v1.3.3)
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
    margin: 12px 0 !important;
    padding: 12px !important;
    background-color: #f8fafc !important;
    border: 2px solid #5865f2 !important;
    border-radius: 8px !important;
    font-family: Inter, sans-serif !important;
    gap: 10px !important;
    z-index: 2147483647 !important;
  `;

  const header = document.createElement("div");
  header.style.cssText = `display: flex !important; justify-content: space-between !important; align-items: center !important;`;

  const title = document.createElement("span");
  title.textContent = "SESSION ID";
  title.style.cssText = `font-size: 11px !important; font-weight: 800 !important; color: #5865f2 !important;`;

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.style.cssText = `
    background: #5865f2 !important;
    color: white !important;
    border: none !important;
    border-radius: 4px !important;
    padding: 5px 12px !important;
    cursor: pointer !important;
    font-size: 12px !important;
    font-weight: 700 !important;
  `;

  copyBtn.onclick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(sessionId).then(() => {
      copyBtn.textContent = "✅";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
    });
  };

  header.appendChild(title);
  header.appendChild(copyBtn);

  const valBox = document.createElement("div");
  valBox.textContent = sessionId;
  valBox.style.cssText = `
    font-family: monospace !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    background: #ffffff !important;
    padding: 10px !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
    text-align: center !important;
    color: #1a1b20 !important;
  `;

  container.appendChild(header);
  container.appendChild(valBox);
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
      const spans = detailsContainer.querySelectorAll('span');
      for (const span of spans) {
        if (span.textContent.includes("Chatting time")) {
          anchor = span.parentElement;
          if (anchor && anchor.children.length < 2) anchor = anchor.parentElement;
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
console.log("LiveChat Extension v1.3.3 Initialized");
