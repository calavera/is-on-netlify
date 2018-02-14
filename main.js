'use strict';

function isNetlifyServer(responseHeaders) {
  const header = responseHeaders.find(header => header.name.toLowerCase() === 'server');
  return header && header.value === 'Netlify';
}

function getTabsUpdatedHandler(targetTabId) {
  return function callback(updatedTabId) {
    if (targetTabId === updatedTabId) {
      chrome.browserAction.setIcon({
        path: "icon-success-32.png",
        tabId: updatedTabId,
      });
    }
    chrome.tabs.onUpdated.removeListener(callback);
  };
}

function getHeadersReceivedHandler() {
  return function callback({ responseHeaders, tabId }) {
    if (isNetlifyServer(responseHeaders)) {
      chrome.tabs.onUpdated.addListener(getTabsUpdatedHandler(tabId));
    }
  };
}

chrome.webRequest.onHeadersReceived.addListener(
  getHeadersReceivedHandler(),
  {urls: ['<all_urls>'], types: ['main_frame']},
  ['responseHeaders']
);
