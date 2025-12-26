// Live Highlighter - Content Script
// CSS Custom Highlight API implementation for maximum performance

(function ()
{
  'use strict';

  // Access namespace
  const { Storage, SKIP_ELEMENTS, HIGHLIGHT_PREFIX, MUTATION_DEBOUNCE_MS } = LiveHighlighter;

  // ============================================================================
  // State Management
  // ============================================================================

  let groups = [];   // Groups from storage
  let rules = [];    // Flattened rules for highlighting (derived from groups)
  let enabled = true;
  let observer = null;
  let debounceTimer = null;
  let scrollTimer = null;

  // Cache of Range objects per highlight name for quick updates
  // Map<highlightName, Set<Range>>
  const rangeCache = new Map();

  // ============================================================================
  // Browser Compatibility Check
  // ============================================================================

  /**
   * Check if CSS Custom Highlight API is supported
   * @returns {boolean}
   */
  function isHighlightAPISupported()
  {
    return 'highlights' in CSS;
  }

  // ============================================================================
  // Groups to Rules Flattening
  // ============================================================================

  /**
   * Flatten groups into a flat array of word-color mappings
   * This maintains compatibility with existing highlighting logic
   * @param {Array} groups - Array of group objects
   * @returns {Array} Flat array of {text, colour, textColor, enabled, order} objects
   */
  function flattenGroupsToRules(groups)
  {
    const flatRules = [];

    groups.forEach(group =>
    {
      if (!group.enabled) return;

      group.words.forEach(word =>
      {
        flatRules.push({
          text: word.trim(),
          colour: group.colour,
          textColor: group.textColor,
          enabled: true,
          order: group.order  // Inherit priority from group
        });
      });
    });

    return flatRules;
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the highlighter
   */
  async function init()
  {
    console.log('Live Highlighter: Content script initializing');

    // Check browser compatibility
    if (!isHighlightAPISupported()) {
      console.error('Live Highlighter: CSS Custom Highlight API not supported in this browser');
      console.error('Live Highlighter: Chrome 105+ or Edge 105+ required');
      return;
    }

    // Load initial state from storage
    groups = await Storage.getGroups();
    enabled = await Storage.getEnabled();

    // Flatten groups to rules for highlighting
    rules = flattenGroupsToRules(groups);

    console.log(`Live Highlighter: Loaded ${groups.length} groups (${rules.length} words), enabled: ${enabled}`);

    if (enabled && rules.length > 0) {
      // Process the current page
      highlightPage();

      // Set up mutation observer for dynamic content
      setupMutationObserver();

      // Set up scroll handler for virtual scrolling support
      setupScrollHandler();

      // Fallback: Re-scan after delays to catch late-loading content
      // This helps with SPAs like Azure Portal that load content dynamically
      setTimeout(() => highlightPage(), 1000);
      setTimeout(() => highlightPage(), 3000);
    }

    // Listen for storage changes from background script
    setupMessageListener();
  }

  // ============================================================================
  // CSS Highlight API Core Functions
  // ============================================================================

  /**
   * Highlight all matching text on the current page
   */
  function highlightPage()
  {
    if (!enabled || rules.length === 0) {
      clearAllHighlights();
      return;
    }

    // Use requestIdleCallback for better performance on large pages
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() =>
      {
        processDocument();
      }, { timeout: 1000 });
    } else {
      processDocument();
    }
  }

  /**
   * Process the entire document to create highlights
   */
  function processDocument()
  {
    if (!enabled || rules.length === 0) {
      return;
    }

    // Clear existing highlights and ranges
    clearAllHighlights();

    // Process the entire document starting from documentElement
    // This catches all content including portals, layer hosts, and overlays
    if (document.documentElement) {
      processNode(document.documentElement);
    }
  }

  /**
   * Process a DOM node and its descendants for highlighting
   * @param {Node} node - The node to process
   */
  function processNode(node)
  {
    if (!node || !enabled || rules.length === 0) {
      return;
    }

    // Process the regular DOM tree
    processNodeDOM(node);

    // Process shadow DOM trees
    processShadowRoots(node);
  }

  /**
   * Process a DOM tree (regular or shadow)
   * @param {Node} root - The root node to process
   */
  function processNodeDOM(root)
  {
    if (!root) return;

    // Create a TreeWalker to find all text nodes
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node)
        {
          // Skip nodes in excluded elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          // Skip if parent is excluded element
          if (SKIP_ELEMENTS.includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip empty text nodes
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    // Collect all text nodes first
    const textNodes = [];
    let currentNode;
    while (currentNode = walker.nextNode()) {
      textNodes.push(currentNode);
    }

    // Process each text node
    textNodes.forEach(textNode =>
    {
      highlightTextNode(textNode);
    });
  }

  /**
   * Process shadow DOM roots recursively
   * @param {Node} node - The node to search for shadow roots
   */
  function processShadowRoots(node)
  {
    if (!node) return;

    // If this node has a shadow root, process it
    if (node.shadowRoot) {
      processNodeDOM(node.shadowRoot);
      processShadowRoots(node.shadowRoot);
    }

    // Find all child elements and check for shadow roots
    if (node.querySelectorAll) {
      try {
        const elements = node.querySelectorAll('*');
        elements.forEach(element =>
        {
          if (element.shadowRoot) {
            processNodeDOM(element.shadowRoot);
            processShadowRoots(element.shadowRoot);
          }
        });
      } catch (e) {
        // querySelectorAll can fail on some nodes, silently ignore
      }
    }
  }

  /**
   * Highlight matches in a single text node using CSS Highlight API
   * @param {Text} textNode - The text node to process
   */
  function highlightTextNode(textNode)
  {
    const text = textNode.textContent;
    if (!text) return;

    // Track all matches and their positions
    const matches = [];

    // Check each rule in priority order (rules are already sorted by order field)
    for (const rule of rules) {
      if (!rule.enabled) continue;

      const searchText = rule.text;
      const lowerText = text.toLowerCase();
      const lowerSearch = searchText.toLowerCase();

      let startIndex = 0;
      while (true) {
        const index = lowerText.indexOf(lowerSearch, startIndex);
        if (index === -1) break;

        const endIndex = index + searchText.length;

        // Check if this position is already covered by a higher priority rule
        const isOverlapping = matches.some(m =>
          (index >= m.start && index < m.end) ||
          (endIndex > m.start && endIndex <= m.end) ||
          (index <= m.start && endIndex >= m.end)
        );

        if (!isOverlapping) {
          matches.push({
            start: index,
            end: endIndex,
            rule: rule
          });
        }

        startIndex = index + 1;
      }
    }

    // If no matches found, nothing to do
    if (matches.length === 0) return;

    // Create Range objects for each match and add to CSS.highlights
    matches.forEach(match =>
    {
      try {
        // Create a Range for this match
        const range = new Range();
        range.setStart(textNode, match.start);
        range.setEnd(textNode, match.end);

        // Get the highlight name for this rule's color
        const highlightName = LiveHighlighter.getHighlightName(match.rule.colour);
        if (!highlightName) {
          console.warn('Live Highlighter: Unknown color', match.rule.colour);
          return;
        }

        // Get or create the Highlight object for this color
        let highlight = CSS.highlights.get(highlightName);
        if (!highlight) {
          highlight = new Highlight();
          CSS.highlights.set(highlightName, highlight);
        }

        // Add this range to the highlight
        highlight.add(range);

        // Cache the range for future updates
        if (!rangeCache.has(highlightName)) {
          rangeCache.set(highlightName, new Set());
        }
        rangeCache.get(highlightName).add(range);
      } catch (e) {
        // Range creation can fail on some edge cases, silently ignore
        console.debug('Live Highlighter: Failed to create range', e);
      }
    });
  }

  /**
   * Clear all highlights from the page
   */
  function clearAllHighlights()
  {
    // Clear all CSS highlights
    CSS.highlights.clear();

    // Clear the range cache
    rangeCache.clear();
  }

  /**
   * Count all highlighted ranges on the page
   * @returns {number} Total number of highlights
   */
  function countHighlights()
  {
    let count = 0;
    for (const highlight of CSS.highlights.values()) {
      count += highlight.size;
    }
    return count;
  }

  /**
   * Refresh all highlights (clear and rebuild)
   */
  function refreshHighlights()
  {
    console.log('Live Highlighter: Refreshing highlights');

    // Disconnect observer temporarily
    if (observer) {
      observer.disconnect();
    }

    // Clear and rebuild
    if (enabled && rules.length > 0) {
      highlightPage();
    } else {
      clearAllHighlights();
    }

    // Reconnect observer
    if (observer && enabled) {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }

  // ============================================================================
  // MutationObserver for Dynamic Content
  // ============================================================================

  /**
   * Check if an element looks like an overlay/menu/modal that should be processed immediately
   * @param {Element} element - Element to check
   * @returns {boolean}
   */
  function isOverlayElement(element)
  {
    if (!element || !element.getAttribute) return false;

    // Check for common overlay/menu/modal attributes and classes
    const role = element.getAttribute('role');
    const classAttr = element.getAttribute('class') || '';
    const tagName = element.tagName;

    return (
      // ARIA roles for menus and dialogs
      role === 'menu' ||
      role === 'menuitem' ||
      role === 'dialog' ||
      role === 'tooltip' ||
      role === 'listbox' ||
      // Common class patterns
      classAttr.includes('menu') ||
      classAttr.includes('dropdown') ||
      classAttr.includes('popover') ||
      classAttr.includes('modal') ||
      classAttr.includes('overlay') ||
      classAttr.includes('contextmenu') ||
      classAttr.includes('flyout') ||
      // Common tags
      tagName === 'DIALOG'
    );
  }

  /**
   * Set up mutation observer to handle dynamic content changes
   */
  function setupMutationObserver()
  {
    if (!enabled || rules.length === 0) {
      return;
    }

    observer = new MutationObserver((mutations) =>
    {
      // Check if any mutations contain overlay elements that need immediate processing
      let hasOverlay = false;
      const overlayNodes = [];

      mutations.forEach(mutation =>
      {
        mutation.addedNodes.forEach(node =>
        {
          if (node.nodeType === Node.ELEMENT_NODE && isOverlayElement(node)) {
            hasOverlay = true;
            overlayNodes.push(node);
          }
        });
      });

      // Process overlay elements immediately (menus, dropdowns, tooltips)
      if (hasOverlay) {
        overlayNodes.forEach(node => processNode(node));
      }

      // Debounce other mutations to avoid excessive processing
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() =>
      {
        // Process each mutation
        mutations.forEach(mutation =>
        {
          // Handle added nodes
          mutation.addedNodes.forEach(node =>
          {
            // Skip if we already processed it as an overlay
            if (overlayNodes.includes(node)) return;

            if (node.nodeType === Node.ELEMENT_NODE) {
              processNode(node);
            } else if (node.nodeType === Node.TEXT_NODE) {
              highlightTextNode(node);
            }
          });
        });
      }, MUTATION_DEBOUNCE_MS);
    });

    // Observe the entire document to catch all overlays, portals, and layer hosts
    // This is generic and works across all frameworks (React portals, Vue teleport, etc.)
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    console.log('Live Highlighter: MutationObserver started');
  }

  /**
   * Set up scroll handler to re-highlight content after scrolling
   * This handles virtual scrolling where DOM nodes are removed/re-added
   */
  function setupScrollHandler()
  {
    // Listen for scroll on ANY element (using capture phase)
    // This catches scrolling in containers, not just window
    document.addEventListener('scroll', () =>
    {
      // Clear existing timer
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      // Re-highlight after scrolling stops (300ms debounce)
      scrollTimer = setTimeout(() =>
      {
        if (enabled && rules.length > 0) {
          // With CSS Highlight API, we can just re-process the page
          // This is fast because we only create Range objects, no DOM manipulation
          highlightPage();
        }
      }, 300);
    }, { passive: true, capture: true });

    console.log('Live Highlighter: Scroll handler started');
  }

  // ============================================================================
  // Message Handling
  // ============================================================================

  /**
   * Set up listener for messages from background script
   */
  function setupMessageListener()
  {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
    {
      console.log('Live Highlighter: Content script received message', message);

      switch (message.type) {
        case 'STORAGE_CHANGED':
          handleStorageChange(message.changes);
          sendResponse({ success: true });
          break;

        case 'GET_HIGHLIGHT_COUNT':
          const count = countHighlights();
          sendResponse({ success: true, count });
          break;

        default:
          console.warn('Live Highlighter: Unknown message type', message.type);
      }

      return true; // Keep the message channel open for async response
    });
  }

  /**
   * Handle storage changes
   * @param {object} changes - Storage changes object
   */
  async function handleStorageChange(changes)
  {
    let needsRefresh = false;

    if (changes.groups) {
      groups = await Storage.getGroups();
      rules = flattenGroupsToRules(groups);
      needsRefresh = true;
    }

    if (changes.enabled) {
      enabled = await Storage.getEnabled();
      needsRefresh = true;
    }

    if (needsRefresh) {
      refreshHighlights();
    }
  }

  // ============================================================================
  // Initialize on page load
  // ============================================================================

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already ready
    init();
  }

  console.log('Live Highlighter: Content script loaded');

})();
