// Live Highlighter - Content Script
// CSS Custom Highlight API implementation for maximum performance

(function ()
{
  'use strict';

  // Access namespace
  const { Storage, SKIP_ELEMENTS, HIGHLIGHT_PREFIX, MUTATION_DEBOUNCE_MS,
    ACTIVE_HIGHLIGHT_NAME, ACTIVE_HIGHLIGHT_COLOR, ACTIVE_HIGHLIGHT_TEXT_COLOR } = LiveHighlighter;

  // ============================================================================
  // State Management
  // ============================================================================

  let groups = [];   // Groups from storage
  let compiledGroups = [];    // Pre-compiled regex per group (derived from groups)
  let enabled = true;
  let observer = null;
  let debounceTimer = null;
  let scrollTimer = null;

  // Cache of Range objects per highlight name for quick updates
  // Map<highlightName, Set<Range>>
  const rangeCache = new Map();

  // Navigation state
  let navRanges = [];       // All ranges sorted in document order (main document only)
  let navCurrentIndex = -1; // Current position (-1 = not navigating)
  let navDirty = false;     // Flag to rebuild when highlights change
  let navScrolling = false; // True while navigation scroll is in progress

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

  function escapeRegExp(string)
  {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Compile groups into pre-built regex objects, one per enabled group.
   * Called once when groups load; reused across every text node for O(groups) cost
   * instead of O(words) per text node.
   * @param {Array} groups - Array of group objects
   * @returns {Array} Priority-sorted array of {regex, colour, order} objects
   */
  function compileGroupRegexes(groups)
  {
    const compiled = [];

    for (const group of groups) {
      if (!group.enabled || !group.words || group.words.length === 0) continue;

      const flags = group.caseSensitive ? 'g' : 'gi';
      let pattern;

      if (group.useRegex) {
        const validPatterns = [];
        for (const word of group.words) {
          const trimmed = word.trim();
          if (!trimmed) continue;
          try {
            new RegExp(trimmed);
            validPatterns.push(`(?:${trimmed})`);
          } catch (e) {
            // invalid regex pattern, skip silently
          }
        }
        if (validPatterns.length === 0) continue;
        pattern = validPatterns.join('|');
      } else {
        const escapedWords = group.words
          .map(w => w.trim())
          .filter(w => w.length > 0)
          .map(w => escapeRegExp(w));

        if (escapedWords.length === 0) continue;

        pattern = group.matchWholeWord
          ? escapedWords.map(w => `\\b${w}\\b`).join('|')
          : escapedWords.join('|');
      }

      try {
        compiled.push({
          regex: new RegExp(pattern, flags),
          colour: group.colour,
          order: group.order
        });
      } catch (e) {
        console.warn('Live Highlighter: Failed to compile group regex', e);
      }
    }

    compiled.sort((a, b) => a.order - b.order);
    return compiled;
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the highlighter
   */
  async function init()
  {
    const isFrame = window.self !== window.top;
    const frameInfo = isFrame ? ' [IFRAME]' : ' [MAIN]';
    console.log(`Live Highlighter: Content script initializing${frameInfo}`);

    // Check browser compatibility
    if (!isHighlightAPISupported()) {
      console.error('Live Highlighter: CSS Custom Highlight API not supported in this browser');
      console.error('Live Highlighter: Chrome 105+ or Edge 105+ required');
      return;
    }

    // Load initial state from storage
    groups = await Storage.getGroups();
    enabled = await Storage.getEnabled();

    compiledGroups = compileGroupRegexes(groups);

    const totalWords = groups.reduce((sum, g) => g.enabled ? sum + g.words.length : sum, 0);
    console.log(`Live Highlighter${frameInfo}: Loaded ${groups.length} groups (${totalWords} words), enabled: ${enabled}`);

    if (!document.getElementById('live-highlighter-styles')) {
      injectStylesIntoDocument(document);
    }

    if (enabled && compiledGroups.length > 0) {
      // Process the current page
      highlightPage();

      // Set up mutation observer for dynamic content
      setupMutationObserver();

      // Set up scroll handler for virtual scrolling support
      setupScrollHandler();

      // Fallback: Re-scan after delays to catch late-loading content
      // This helps with SPAs like Azure Portal that load content dynamically
      // Skip if navigation is active to avoid destroying navigation state
      setTimeout(() => { if (navCurrentIndex < 0) highlightPage(); }, 1000);
      setTimeout(() => { if (navCurrentIndex < 0) highlightPage(); }, 3000);
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
    if (!enabled || compiledGroups.length === 0) {
      clearAllHighlights();
      return;
    }

    // Use requestIdleCallback for better performance on large pages
    // Guard: skip if navigation is active to avoid destroying navigation state
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() =>
      {
        if (navCurrentIndex < 0) {
          processDocument();
        }
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
    if (!enabled || compiledGroups.length === 0) {
      return;
    }

    // Clear existing highlights and ranges
    clearAllHighlights();

    // Process the entire document starting from documentElement
    // This catches all content including portals, layer hosts, and overlays
    if (document.documentElement) {
      processNode(document.documentElement);
    }

    // Also process same-origin iframes that were created with document.write()
    // These don't get content scripts injected, so we need to process them from the parent
    processSameOriginIframes();
  }

  /**
   * Process a DOM node and its descendants for highlighting
   * @param {Node} node - The node to process
   */
  function processNode(node)
  {
    if (!node || !enabled || compiledGroups.length === 0) {
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
   * @param {Document} doc - The document context (for accessing CSS.highlights)
   */
  function processNodeDOM(root, doc = document)
  {
    if (!root) return;

    // Use the document that owns this root node to create the TreeWalker
    const ownerDoc = root.ownerDocument || doc;
    const walker = ownerDoc.createTreeWalker(
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

    // Process each text node with the correct document context
    textNodes.forEach(textNode =>
    {
      highlightTextNode(textNode, ownerDoc);
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
   * Process same-origin iframes that don't get content scripts injected
   * This handles iframes created with document.write() which don't trigger content script injection
   */
  function processSameOriginIframes()
  {
    // Find all iframes in the document
    const iframes = document.querySelectorAll('iframe');

    iframes.forEach(iframe =>
    {
      try {
        // Try to access the iframe's contentDocument
        // This will throw if the iframe is cross-origin
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

        if (iframeDoc && iframeDoc.documentElement) {
          // We can access it, so it's same-origin

          // Inject CSS styles into the iframe if not already present
          if (!iframeDoc.getElementById('live-highlighter-styles')) {
            injectStylesIntoDocument(iframeDoc);
          }

          // Process the iframe's document with the correct document context
          processNodeDOM(iframeDoc.documentElement, iframeDoc);
          processShadowRoots(iframeDoc.documentElement);
        }
      } catch (e) {
        // Cross-origin iframe - we can't access it, skip silently
        // This is expected and normal for cross-origin iframes
      }
    });
  }

  /**
   * Inject highlight CSS styles into a document
   * @param {Document} doc - The document to inject styles into
   */
  function injectStylesIntoDocument(doc)
  {
    try {
      // Create a style element
      const styleEl = doc.createElement('style');
      styleEl.id = 'live-highlighter-styles';

      // Generate CSS from PRESET_COLOURS (single source of truth)
      const cssRules = LiveHighlighter.PRESET_COLOURS.map(color => {
        const highlightName = LiveHighlighter.getHighlightName(color.hex);
        return `::highlight(${highlightName}) { background-color: ${color.hex}; color: ${color.textColor}; }`;
      }).join('\n        ');

      // Active highlight for navigation (painted on top)
      const activeRule = `::highlight(${ACTIVE_HIGHLIGHT_NAME}) { background-color: ${ACTIVE_HIGHLIGHT_COLOR}; color: ${ACTIVE_HIGHLIGHT_TEXT_COLOR}; text-decoration: underline 3px #1A73E8; }`;

      styleEl.textContent = `/* Live Highlighter - CSS Custom Highlight API Styles */\n        ${cssRules}\n        ${activeRule}`;

      // Append to the document head
      (doc.head || doc.documentElement).appendChild(styleEl);
    } catch (e) {
      console.error('Live Highlighter: Failed to inject styles', e);
    }
  }

  /**
   * Highlight matches in a single text node using CSS Highlight API
   * @param {Text} textNode - The text node to process
   * @param {Document} doc - The document context (for accessing CSS.highlights)
   */
  function highlightTextNode(textNode, doc = document)
  {
    const text = textNode.textContent;
    if (!text) return;

    const cssHighlights = doc.defaultView?.CSS?.highlights;
    if (!cssHighlights) {
      console.warn('Live Highlighter: CSS Highlight API not available in this document context');
      return;
    }

    // Collect all matches across all groups in priority order.
    // compiledGroups is pre-sorted by group priority; the overlap check ensures
    // higher-priority groups claim positions before lower-priority ones.
    const matches = [];

    for (const compiledGroup of compiledGroups) {
      compiledGroup.regex.lastIndex = 0;
      let match;
      while ((match = compiledGroup.regex.exec(text)) !== null) {
        if (match[0].length === 0) {
          compiledGroup.regex.lastIndex++;
          continue;
        }

        const start = match.index;
        const end = start + match[0].length;

        const isOverlapping = matches.some(m =>
          (start >= m.start && start < m.end) ||
          (end > m.start && end <= m.end) ||
          (start <= m.start && end >= m.end)
        );

        if (!isOverlapping) {
          matches.push({ start, end, colour: compiledGroup.colour });
        }
      }
    }

    if (matches.length === 0) return;

    matches.forEach(match =>
    {
      try {
        const range = doc.createRange();
        range.setStart(textNode, match.start);
        range.setEnd(textNode, match.end);

        const highlightName = LiveHighlighter.getHighlightName(match.colour);
        if (!highlightName) {
          console.warn('Live Highlighter: Unknown color', match.colour);
          return;
        }

        let highlight = cssHighlights.get(highlightName);
        if (!highlight) {
          highlight = new doc.defaultView.Highlight();
          cssHighlights.set(highlightName, highlight);
        }

        highlight.add(range);

        if (!rangeCache.has(highlightName)) {
          rangeCache.set(highlightName, new Set());
        }
        rangeCache.get(highlightName).add(range);

        navDirty = true;
      } catch (e) {
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

    // Reset navigation state
    clearNavigation();
  }

  /**
   * Remove stale ranges (detached text nodes) from rangeCache and CSS.highlights.
   * This keeps counts accurate on dynamic pages where content is added/removed.
   */
  function pruneStaleRanges()
  {
    for (const [highlightName, rangeSet] of rangeCache.entries()) {
      const highlight = CSS.highlights.get(highlightName);
      const staleRanges = [];

      for (const range of rangeSet) {
        try {
          if (!range.startContainer.isConnected || range.toString().length === 0) {
            staleRanges.push(range);
          }
        } catch (e) {
          staleRanges.push(range);
        }
      }

      for (const range of staleRanges) {
        rangeSet.delete(range);
        if (highlight) highlight.delete(range);
      }

      // Clean up empty entries
      if (rangeSet.size === 0) {
        rangeCache.delete(highlightName);
        if (highlight && highlight.size === 0) {
          CSS.highlights.delete(highlightName);
        }
      }
    }
  }

  /**
   * Count all highlighted ranges on the page
   * @returns {number} Total number of highlights
   */
  function countHighlights()
  {
    pruneStaleRanges();
    let count = 0;
    for (const [name, highlight] of CSS.highlights.entries()) {
      // Skip the active navigation highlight from the count
      if (name === ACTIVE_HIGHLIGHT_NAME) continue;
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
    if (enabled && compiledGroups.length > 0) {
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
    if (!enabled || compiledGroups.length === 0) {
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
        let hasNewIframes = false;

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

              // Check if this is an iframe or contains iframes
              if (node.tagName === 'IFRAME') {
                hasNewIframes = true;
              } else if (node.querySelectorAll) {
                const iframes = node.querySelectorAll('iframe');
                if (iframes.length > 0) {
                  hasNewIframes = true;
                }
              }
            } else if (node.nodeType === Node.TEXT_NODE) {
              highlightTextNode(node);
            }
          });
        });

        // If new iframes were added, process them after a delay to allow document.write() to complete
        if (hasNewIframes) {
          setTimeout(() => processSameOriginIframes(), 100);
          setTimeout(() => processSameOriginIframes(), 500);
        }
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
      // Skip when navigating or during navigation scroll to preserve state
      scrollTimer = setTimeout(() =>
      {
        if (enabled && compiledGroups.length > 0 && navCurrentIndex < 0 && !navScrolling) {
          // With CSS Highlight API, we can just re-process the page
          // This is fast because we only create Range objects, no DOM manipulation
          highlightPage();
        }
      }, 300);
    }, { passive: true, capture: true });

    console.log('Live Highlighter: Scroll handler started');
  }

  // ============================================================================
  // Highlight Navigation
  // ============================================================================

  /**
   * Build a sorted list of all highlight ranges in the main document.
   * Excludes iframe ranges since Range.compareBoundaryPoints throws across documents.
   */
  function buildNavigationList()
  {
    pruneStaleRanges();

    // Save the current range to restore position after rebuild
    const currentRange = (navCurrentIndex >= 0 && navCurrentIndex < navRanges.length)
      ? navRanges[navCurrentIndex]
      : null;

    navRanges = [];

    for (const rangeSet of rangeCache.values()) {
      for (const range of rangeSet) {
        // Only include ranges that are still connected to the main document
        try {
          if (range.startContainer.ownerDocument === document &&
              range.startContainer.isConnected &&
              range.toString().length > 0) {
            navRanges.push(range);
          }
        } catch (e) {
          // Range may have been detached, skip it
        }
      }
    }

    // Sort ranges in document order
    navRanges.sort((a, b) =>
    {
      try {
        return a.compareBoundaryPoints(Range.START_TO_START, b);
      } catch (e) {
        return 0;
      }
    });

    // Restore position if the current range still exists in the new list
    if (currentRange) {
      const restoredIndex = navRanges.indexOf(currentRange);
      navCurrentIndex = restoredIndex >= 0 ? restoredIndex : -1;
    } else {
      navCurrentIndex = -1;
    }

    navDirty = false;
  }

  /**
   * Navigate to the next or previous highlight
   * @param {'next'|'prev'} direction
   * @returns {{ index: number, total: number }} 1-based index and total count
   */
  function navigateHighlight(direction)
  {
    // Always rebuild to prune stale ranges and get accurate count
    buildNavigationList();

    if (navRanges.length === 0) {
      return { index: 0, total: 0, text: '' };
    }

    if (direction === 'next') {
      navCurrentIndex = (navCurrentIndex + 1) % navRanges.length;
    } else {
      navCurrentIndex = (navCurrentIndex - 1 + navRanges.length) % navRanges.length;
    }

    const range = navRanges[navCurrentIndex];
    setActiveHighlight(range);
    scrollToRange(range);

    return { index: navCurrentIndex + 1, total: navRanges.length, text: range.toString() };
  }

  /**
   * Set the active (focused) highlight for navigation
   * @param {Range} range - The range to highlight as active
   */
  function setActiveHighlight(range)
  {
    try {
      CSS.highlights.delete(ACTIVE_HIGHLIGHT_NAME);
      const highlight = new Highlight(range);
      highlight.priority = 1000; // Paint on top of regular highlights
      CSS.highlights.set(ACTIVE_HIGHLIGHT_NAME, highlight);
    } catch (e) {
      console.debug('Live Highlighter: Failed to set active highlight', e);
    }
  }

  /**
   * Check if an element is within the visible viewport
   * @param {Element} el
   * @returns {boolean}
   */
  function isElementInViewport(el)
  {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  /**
   * Scroll the page to bring the given range into view, centered vertically
   * Uses the parent element's scrollIntoView which handles nested scroll containers
   * Sets navScrolling flag to suppress scroll handler during the animation
   * @param {Range} range
   */
  function scrollToRange(range)
  {
    try {
      const node = range.startContainer;
      if (!node.isConnected) return;

      const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      if (el && el.scrollIntoView) {
        // Only set navScrolling if the element actually needs scrolling
        if (!isElementInViewport(el)) {
          navScrolling = true;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Clear flag after smooth scroll completes (~500ms is typical)
          setTimeout(() => { navScrolling = false; }, 600);
        }
      }
    } catch (e) {
      navScrolling = false;
      console.debug('Live Highlighter: Failed to scroll to range', e);
    }
  }

  /**
   * Get current navigation state
   * @returns {{ index: number, total: number }}
   */
  function getNavigationState()
  {
    // Always rebuild to prune stale ranges and get accurate count
    buildNavigationList();
    return {
      index: navCurrentIndex >= 0 ? navCurrentIndex + 1 : 0,
      total: navRanges.length,
      text: navCurrentIndex >= 0 ? navRanges[navCurrentIndex].toString() : ''
    };
  }

  /**
   * Clear navigation state
   */
  function clearNavigation()
  {
    navRanges = [];
    navCurrentIndex = -1;
    navDirty = false;
    navScrolling = false;
    try {
      CSS.highlights.delete(ACTIVE_HIGHLIGHT_NAME);
    } catch (e) {
      // Ignore - highlights may already be cleared
    }
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
          handleStorageChange(message.changes).then(() =>
          {
            sendResponse({ success: true });
          });
          return true; // Keep channel open for async response

        case 'GET_HIGHLIGHT_COUNT':
          const count = countHighlights();
          sendResponse({ success: true, count });
          break;

        case 'NAVIGATE_HIGHLIGHT':
          const navResult = navigateHighlight(message.direction);
          sendResponse({ success: true, ...navResult });
          break;

        case 'GET_NAVIGATION_STATE':
          const navState = getNavigationState();
          sendResponse({ success: true, ...navState });
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
      compiledGroups = compileGroupRegexes(groups);
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
