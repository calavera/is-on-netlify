'use strict';

const HEADER_KEYS = [ 'server', 'host' ];
const NON_HOSTS = [ 'cloudflare' ];
const HOST_MAP = {
  gws: 'Google',
}

function getHost(responseHeaders) {
  for (let key of HEADER_KEYS) {
    const header = responseHeaders.find(h => h.name.toLowerCase() === key);
    if (header && header.value) {
      return HOST_MAP[header.value] || header.value;
    }
  }
}

function getTabsUpdatedHandler(targetTabId, host) {
  return function callback(updatedTabId) {
    if (targetTabId !== updatedTabId) return;
    const title = host && !NON_HOSTS.includes(host)
      ? `Hosted with ${host}`
      : `Could not determine host (${host})`;
    chrome.browserAction.setTitle({ title, tabId: updatedTabId });
    chrome.browserAction.setIcon({
      path: `icon-${host === 'Netlify' ? 'success-' : ''}32.png`,
      tabId: updatedTabId,
    });
  };
}

function getTabsRemovedHandler(handler) {
  return function callback() {
    chrome.tabs.onUpdated.removeListener(handler);
    chrome.tabs.onRemoved.removeListener(getTabsRemovedHandler);
  }
}

function getHeadersReceivedHandler() {
  return function callback({ responseHeaders, tabId }) {
    const host = getHost(responseHeaders);
    if (host) {
      const handler = getTabsUpdatedHandler(tabId, host);
      chrome.tabs.onUpdated.addListener(handler);
      chrome.tabs.onRemoved.addListener(getTabsRemovedHandler(handler));
    }
  };
}

chrome.webRequest.onHeadersReceived.addListener(
  getHeadersReceivedHandler(),
  {urls: ['<all_urls>'], types: ['main_frame']},
  ['responseHeaders']
);
