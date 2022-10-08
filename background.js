function injectScriptToTab(tabId) {
  chrome.scripting.executeScript(
      {
          target: {tabId: tabId},
          files: ['inject.js'],
      }
  )
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
      injectScriptToTab(tabId)

  }
})
