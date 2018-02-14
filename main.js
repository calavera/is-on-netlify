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

function getHeadersReceivedHandler() {
  return function callback({ responseHeaders, tabId }) {
    const host = getHost(responseHeaders);
    if (host) {
      chrome.tabs.onUpdated.addListener(getTabsUpdatedHandler(tabId, host));
    }
  };
}

chrome.webRequest.onHeadersReceived.addListener(
  getHeadersReceivedHandler(),
  {urls: ['<all_urls>'], types: ['main_frame']},
  ['responseHeaders']
);
