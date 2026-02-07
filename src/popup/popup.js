// Live Highlighter - Popup Logic

(function ()
{
  'use strict';

  // Access namespace
  const { Storage, i18n } = LiveHighlighter;

  // Helper for translated messages
  const msg = (key, substitutions) => i18n.getMessage(key, substitutions);

  // DOM elements
  let globalToggle;
  let ruleCountSpan;
  let highlightCountSpan;
  let openOptionsBtn;
  let versionDiv;
  let navControls;
  let navPrev;
  let navNext;
  let navPosition;
  let navText;

  // ============================================================================
  // Initialization
  // ============================================================================

  async function init()
  {
    console.log('Live Highlighter: Popup initializing');

    // Apply translations
    LiveHighlighter.i18n.applyTranslations();

    // Get DOM elements
    globalToggle = document.getElementById('globalToggle');
    ruleCountSpan = document.getElementById('ruleCount');
    highlightCountSpan = document.getElementById('highlightCount');
    openOptionsBtn = document.getElementById('openOptionsBtn');
    versionDiv = document.getElementById('version');
    navControls = document.getElementById('navControls');
    navPrev = document.getElementById('navPrev');
    navNext = document.getElementById('navNext');
    navPosition = document.getElementById('navPosition');
    navText = document.getElementById('navText');

    // Set version from manifest
    const manifest = chrome.runtime.getManifest();
    versionDiv.textContent = `v${manifest.version}`;

    // Load current state
    await loadStatus();

    // Check if we should show the get started banner
    await checkGetStartedBanner();

    // Set up event listeners
    globalToggle.addEventListener('click', handleGlobalToggle);
    openOptionsBtn.addEventListener('click', handleOpenOptions);
    navPrev.addEventListener('click', () => handleNavigate('prev'));
    navNext.addEventListener('click', () => handleNavigate('next'));
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
      const toggleSlider = globalToggle.querySelector('.toggle-slider');
      if (enabled) {
        toggleSlider.classList.add('active');
      } else {
        toggleSlider.classList.remove('active');
      }

      // Get groups and count enabled vs total
      const groups = await Storage.getGroups();
      const enabledGroups = groups.filter(g => g.enabled);
      ruleCountSpan.textContent = `${enabledGroups.length} / ${groups.length}`;

      // Get highlight count from active tab
      await getHighlightCount();

    } catch (error) {
      console.error('Live Highlighter: Error loading status', error);
      ruleCountSpan.textContent = msg('statusError');
      highlightCountSpan.textContent = msg('statusError');
    }
  }

  async function getHighlightCount()
  {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        highlightCountSpan.textContent = msg('statusNotAvailable');
        return;
      }

      // Check if we can access this tab (some tabs like chrome:// are restricted)
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
        highlightCountSpan.textContent = msg('statusNotAvailable');
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
            for (const [name, highlight] of CSS.highlights.entries()) {
              // Skip the active navigation highlight from the count
              if (name === 'lh-active') continue;
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

        // Show/hide navigation controls based on highlight count
        if (totalCount > 0) {
          navControls.style.display = 'flex';
          updateNavigationState(tab.id);
        } else {
          navControls.style.display = 'none';
        }

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
      highlightCountSpan.textContent = msg('statusError');
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  async function handleGlobalToggle()
  {
    const toggleSlider = globalToggle.querySelector('.toggle-slider');
    const currentEnabled = await Storage.getEnabled();
    const newEnabled = !currentEnabled;

    try {
      const success = await Storage.setEnabled(newEnabled);

      if (success) {
        // Update visual state
        if (newEnabled) {
          toggleSlider.classList.add('active');
        } else {
          toggleSlider.classList.remove('active');
        }

        // Update highlight count after toggling
        setTimeout(() =>
        {
          getHighlightCount();
        }, 500); // Give content script time to update
      } else {
        alert(msg('notifFailedUpdateSetting'));
      }
    } catch (error) {
      console.error('Live Highlighter: Error toggling', error);
      alert(msg('notifFailedUpdateSetting'));
    }
  }

  function handleOpenOptions()
  {
    // Open the options page
    chrome.runtime.openOptionsPage();
  }

  // ============================================================================
  // Highlight Navigation
  // ============================================================================

  async function handleNavigate(direction)
  {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      chrome.tabs.sendMessage(
        tab.id,
        { type: 'NAVIGATE_HIGHLIGHT', direction },
        { frameId: 0 },
        (response) =>
        {
          if (chrome.runtime.lastError || !response || !response.success) return;
          updateNavDisplay(response);
        }
      );
    } catch (error) {
      console.error('Live Highlighter: Error navigating', error);
    }
  }

  function updateNavigationState(tabId)
  {
    chrome.tabs.sendMessage(
      tabId,
      { type: 'GET_NAVIGATION_STATE' },
      { frameId: 0 },
      (response) =>
      {
        if (chrome.runtime.lastError || !response || !response.success) return;
        updateNavDisplay(response);
      }
    );
  }

  function updateNavDisplay(response)
  {
    if (response.index > 0) {
      navPosition.textContent = `${response.index} / ${response.total}`;
      navText.textContent = `"${response.text}"`;
      navText.style.display = 'block';
    } else {
      navPosition.textContent = `- / ${response.total}`;
      navText.style.display = 'none';
    }
  }

  // ============================================================================
  // Get Started Banner
  // ============================================================================

  async function checkGetStartedBanner()
  {
    try {
      // Get groups and banner dismissed state
      const groups = await Storage.getGroups();
      const dismissed = await chrome.storage.local.get('bannerDismissed');

      // Show banner if no groups and not dismissed
      if (groups.length === 0 && !dismissed.bannerDismissed) {
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
