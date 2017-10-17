'use strict';

function getHeaderFromHeaders(headers) {
  for (var i = 0; i < headers.length; ++i) {
    var header = headers[i];
    if (header.name.toLowerCase() === "server") {
      return header;
    }
  }
}

function isNetlifyServer(details) {
  var header = getHeaderFromHeaders(details.responseHeaders);
  if (header) {
    return header.value === "Netlify";
  }
}

chrome.webRequest.onHeadersReceived.addListener(
  function callback(details) {
    if (isNetlifyServer(details)) {
      chrome.browserAction.setIcon({path: "icon-success-32.png", tabId: details.tabId});
    }
  },
  {urls: ['<all_urls>'], types: ['main_frame']},
  ['responseHeaders']
);
