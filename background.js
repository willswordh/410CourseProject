function injectScriptToTab(tabId) {
  chrome.scripting.executeScript(
      {
          target: {tabId: tabId},
          files: ['inject.js'],
      }
  )
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // need page to be fully loaded in order to access search results
  if (changeInfo.status == 'complete' && tab.active) {
      injectScriptToTab(tabId)

  }
})
