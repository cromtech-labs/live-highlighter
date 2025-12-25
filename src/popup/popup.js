// Live Highlighter - Popup Logic

(function ()
{
  'use strict';

  // Access namespace
  const { Storage } = LiveHighlighter;

  // DOM elements
  let globalToggle;
  let ruleCountSpan;
  let highlightCountSpan;
  let openOptionsBtn;
  let versionDiv;

  // ============================================================================
  // Initialization
  // ============================================================================

  async function init()
  {
    console.log('Live Highlighter: Popup initializing');

    // Get DOM elements
    globalToggle = document.getElementById('globalToggle');
    ruleCountSpan = document.getElementById('ruleCount');
    highlightCountSpan = document.getElementById('highlightCount');
    openOptionsBtn = document.getElementById('openOptionsBtn');
    versionDiv = document.getElementById('version');

    // Set version from manifest
    const manifest = chrome.runtime.getManifest();
    versionDiv.textContent = `v${manifest.version}`;

    // Load current state
    await loadStatus();

    // Check if we should show the get started banner
    await checkGetStartedBanner();

    // Set up event listeners
    globalToggle.addEventListener('change', handleGlobalToggle);
    openOptionsBtn.addEventListener('click', handleOpenOptions);
    document.getElementById('createFirstRule').addEventListener('click', handleCreateFirstRule);
    document.getElementById('dismissBanner').addEventListener('click', handleDismissBanner);

    console.log('Live Highlighter: Popup initialized');
  }

  // ============================================================================
  // Loading Status
  // ============================================================================

  async function loadStatus()
  {
    try {
      // Get enabled state
      const enabled = await Storage.getEnabled();
      globalToggle.checked = enabled;

      // Get rules count
      const rules = await Storage.getRules();
      const enabledRules = rules.filter(r => r.enabled);
      ruleCountSpan.textContent = `${enabledRules.length} / ${rules.length}`;

      // Get highlight count from active tab
      await getHighlightCount();

    } catch (error) {
      console.error('Live Highlighter: Error loading status', error);
      ruleCountSpan.textContent = 'Error';
      highlightCountSpan.textContent = 'Error';
    }
  }

  async function getHighlightCount()
  {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        highlightCountSpan.textContent = 'N/A';
        return;
      }

      // Check if we can access this tab (some tabs like chrome:// are restricted)
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
        highlightCountSpan.textContent = 'N/A';
        return;
      }

      // Execute script in all frames to count highlights
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          func: () =>
          {
            // This function runs in each frame
            // Count Range objects in CSS.highlights (CSS Highlight API)
            if (!('highlights' in CSS)) {
              return 0; // Browser doesn't support CSS Highlight API
            }

            let count = 0;
            for (const highlight of CSS.highlights.values()) {
              count += highlight.size;
            }
            return count;
          }
        });

        // Sum up counts from all frames
        let totalCount = 0;
        results.forEach(result =>
        {
          if (result.result !== undefined) {
            totalCount += result.result;
          }
        });

        highlightCountSpan.textContent = totalCount;

      } catch (error) {
        // If script execution fails, try the old message-based approach
        chrome.tabs.sendMessage(
          tab.id,
          { type: 'GET_HIGHLIGHT_COUNT' },
          (response) =>
          {
            if (chrome.runtime.lastError) {
              highlightCountSpan.textContent = '0';
              return;
            }

            if (response && response.success) {
              highlightCountSpan.textContent = response.count;
            } else {
              highlightCountSpan.textContent = '0';
            }
          }
        );
      }

    } catch (error) {
      console.error('Live Highlighter: Error getting highlight count', error);
      highlightCountSpan.textContent = 'Error';
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  async function handleGlobalToggle()
  {
    const enabled = globalToggle.checked;

    try {
      const success = await Storage.setEnabled(enabled);

      if (!success) {
        // Revert toggle if save failed
        globalToggle.checked = !enabled;
        alert('Failed to update setting. Please try again.');
      } else {
        // Update highlight count after toggling
        setTimeout(() =>
        {
          getHighlightCount();
        }, 500); // Give content script time to update
      }
    } catch (error) {
      console.error('Live Highlighter: Error toggling', error);
      globalToggle.checked = !enabled;
      alert('Failed to update setting. Please try again.');
    }
  }

  function handleOpenOptions()
  {
    // Open the options page
    chrome.runtime.openOptionsPage();
  }

  // ============================================================================
  // Get Started Banner
  // ============================================================================

  async function checkGetStartedBanner()
  {
    try {
      // Get rules and banner dismissed state
      const rules = await Storage.getRules();
      const dismissed = await chrome.storage.local.get('bannerDismissed');

      // Show banner if no rules and not dismissed
      if (rules.length === 0 && !dismissed.bannerDismissed) {
        document.getElementById('getStartedBanner').style.display = 'block';
      }
    } catch (error) {
      console.error('Live Highlighter: Error checking banner state', error);
    }
  }

  function handleCreateFirstRule()
  {
    // Open options page to create first rule
    chrome.runtime.openOptionsPage();
  }

  async function handleDismissBanner()
  {
    try {
      // Save dismissed state
      await chrome.storage.local.set({ bannerDismissed: true });

      // Hide banner with fade out
      const banner = document.getElementById('getStartedBanner');
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-10px)';
      banner.style.transition = 'opacity 0.2s, transform 0.2s';

      setTimeout(() =>
      {
        banner.style.display = 'none';
      }, 200);
    } catch (error) {
      console.error('Live Highlighter: Error dismissing banner', error);
    }
  }

  // ============================================================================
  // Initialize on page load
  // ============================================================================

  document.addEventListener('DOMContentLoaded', init);

})();
