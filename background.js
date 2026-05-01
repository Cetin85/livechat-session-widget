/**
 * background.js (v1.3.3)
 */

const ID_PATTERN = /([A-Z]{2}[A-Z0-9]{6,})\/([A-Z]{2}[A-Z0-9]{6,})/g;

function extractSessionIdFromUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    const matches = [...url.pathname.matchAll(ID_PATTERN)];
    for (const match of matches) {
      const prefix = match[1];
      const chatId = match[2];
      return { chatId, sessionId: `${prefix}-${chatId}` };
    }
  } catch (e) { }
  return null;
}

function processRequest(details) {
  const result = extractSessionIdFromUrl(details.url);
  if (result) {
    chrome.storage.local.set({ [result.chatId]: result.sessionId, "lastSessionId": result.sessionId });
  }
}

chrome.webRequest.onBeforeRequest.addListener(processRequest, { urls: ["<all_urls>"] });
chrome.webRequest.onCompleted.addListener(processRequest, { urls: ["<all_urls>"] });
