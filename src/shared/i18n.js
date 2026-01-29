// Live Highlighter - Internationalization Helper

(function() {
  'use strict';

  // Check if LiveHighlighter namespace exists (created by constants.js)
  if (typeof LiveHighlighter === 'undefined') {
    console.error('Live Highlighter: i18n.js must be loaded after constants.js');
    return;
  }

  /**
   * Get a localized message
   * @param {string} messageName - The message key from messages.json
   * @param {string|string[]} [substitutions] - Optional substitution strings
   * @returns {string} The localized message or the key if not found
   */
  function getMessage(messageName, substitutions) {
    const message = chrome.i18n.getMessage(messageName, substitutions);
    return message || messageName;
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   * @param {Document|Element} [root=document] - Root element to search within
   */
  function applyTranslations(root = document) {
    // Translate text content
    const elements = root.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const message = getMessage(key);
      if (message && message !== key) {
        el.textContent = message;
      }
    });

    // Translate placeholders
    const placeholders = root.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const message = getMessage(key);
      if (message && message !== key) {
        el.placeholder = message;
      }
    });

    // Translate titles (tooltips)
    const titles = root.querySelectorAll('[data-i18n-title]');
    titles.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const message = getMessage(key);
      if (message && message !== key) {
        el.title = message;
      }
    });

    // Translate page title
    const titleElement = root.querySelector('title[data-i18n]');
    if (titleElement) {
      const key = titleElement.getAttribute('data-i18n');
      const message = getMessage(key);
      if (message && message !== key) {
        document.title = message;
      }
    }
  }

  /**
   * Get the current UI language
   * @returns {string} The UI language code (e.g., 'en', 'es', 'fr')
   */
  function getUILanguage() {
    return chrome.i18n.getUILanguage();
  }

  // Export to namespace
  LiveHighlighter.i18n = {
    getMessage,
    applyTranslations,
    getUILanguage
  };

})();
