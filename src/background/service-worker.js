// Live Highlighter - Service Worker (MV3)

// Import shared modules
importScripts('../shared/constants.js', '../shared/storage.js');

console.log('Live Highlighter: Service worker started');

// Destructure for convenience
const { Storage, STORAGE_KEYS } = LiveHighlighter;

// ============================================================================
// Installation and Update Events
// ============================================================================

/**
 * Handle extension installation or update
 */
chrome.runtime.onInstalled.addListener(async (details) =>
{
  console.log('Live Highlighter: Extension event', details.reason);

  if (details.reason === 'install') {
    // First time installation
    console.log('Live Highlighter: First install - initializing storage');
    await Storage.initializeStorage();

    // Optional: Open options page on first install
    // chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    // Extension updated
    const previousVersion = details.previousVersion;
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Live Highlighter: Updated from ${previousVersion} to ${currentVersion}`);

    // Handle any migration logic here if needed in future versions
    // For now, just ensure storage is initialized
    await Storage.initializeStorage();
  }
});

// ============================================================================
// Message Handling (for communication between components)
// ============================================================================

/**
 * Handle messages from popup, options page, or content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
{
  console.log('Live Highlighter: Message received', message);

  // Handle different message types
  switch (message.type) {
    case 'GET_GROUPS':
      // Popup or content script requesting groups
      Storage.getGroups().then(groups =>
      {
        sendResponse({ success: true, groups });
      });
      return true; // Keep channel open for async response

    case 'GET_ENABLED':
      // Check if highlighting is enabled
      Storage.getEnabled().then(enabled =>
      {
        sendResponse({ success: true, enabled });
      });
      return true;

    case 'TOGGLE_ENABLED':
      // Toggle highlighting on/off
      Storage.getEnabled().then(async (currentState) =>
      {
        const newState = !currentState;
        await Storage.setEnabled(newState);

        // Note: storage.onChanged listener below will handle notifying tabs
        // No need to call notifyAllTabs here (prevents double notification)

        sendResponse({ success: true, enabled: newState });
      });
      return true;

    default:
      console.warn('Live Highlighter: Unknown message type', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Notify all tabs of a change
 * @param {object} message - Message to send to all content scripts
 */
async function notifyAllTabs(message)
{
  try {
    const tabs = await chrome.tabs.query({});

    tabs.forEach(tab =>
    {
      chrome.tabs.sendMessage(tab.id, message).catch(err =>
      {
        // Ignore errors for tabs that don't have content script loaded
        // (e.g., chrome:// pages, extension pages)
      });
    });
  } catch (error) {
    console.error('Live Highlighter: Error notifying tabs', error);
  }
}

// ============================================================================
// Storage Change Monitoring
// ============================================================================

/**
 * Monitor storage changes and propagate to content scripts
 * This is the single source of truth for notifying tabs about storage changes
 */
chrome.storage.onChanged.addListener((changes, area) =>
{
  if (area === 'local') {
    console.log('Live Highlighter: Storage changed', changes);

    // Notify content scripts when groups or enabled state changes
    if (changes[STORAGE_KEYS.GROUPS] || changes[STORAGE_KEYS.ENABLED]) {
      notifyAllTabs({
        type: 'STORAGE_CHANGED',
        changes: changes
      });
    }
  }
});

console.log('Live Highlighter: Service worker initialized');
