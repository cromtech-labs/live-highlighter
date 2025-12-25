// Live Highlighter - Storage Abstraction Layer

/**
 * Rule object schema:
 * {
 *   id: string,        // UUID
 *   text: string,      // String to match
 *   colour: string,    // Hex colour
 *   enabled: boolean,  // Per-rule toggle
 *   order: number      // Priority (lower = higher priority)
 * }
 */

// Extend LiveHighlighter namespace with storage functions
LiveHighlighter.Storage = (function ()
{
  'use strict';

  // Shorthand references to constants
  const { MAX_RULES, PRESET_COLOURS, DEFAULT_RULES, STORAGE_KEYS, DEFAULT_SETTINGS } = LiveHighlighter;

  // ============================================================================
  // Validation Helpers
  // ============================================================================

  /**
   * Validate if a colour is a valid hex color
   * @param {string} colour - Hex colour code
   * @returns {boolean}
   */
  function isValidColour(colour)
  {
    // Accept any valid hex color format (#RGB, #RRGGBB, or #RRGGBBAA)
    // This allows existing rules with old colors and new colors
    if (typeof colour !== 'string') return false;
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(colour);
  }

  /**
   * Validate if text is non-empty after trimming
   * @param {string} text - Text to validate
   * @returns {boolean}
   */
  function isValidText(text)
  {
    return typeof text === 'string' && text.trim().length > 0;
  }

  // ============================================================================
  // Core Storage Functions
  // ============================================================================

  /**
   * Get all rules from storage
   * @returns {Promise<Array>} Array of rule objects
   */
  async function getRules()
  {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.RULES);
      // Return a copy to prevent mutation of stored data
      const rules = result[STORAGE_KEYS.RULES];
      return rules ? [...rules] : [];
    } catch (error) {
      console.error('Live Highlighter: Error getting rules', error);
      return [];
    }
  }

  /**
   * Save rules to storage
   * @param {Array} rules - Array of rule objects
   * @returns {Promise<boolean>} Success status
   */
  async function saveRules(rules)
  {
    try {
      // Validate rules array
      if (!Array.isArray(rules)) {
        console.error('Live Highlighter: saveRules requires an array');
        return false;
      }

      // Enforce MAX_RULES limit
      if (rules.length > MAX_RULES) {
        console.warn(`Live Highlighter: Cannot save more than ${MAX_RULES} rules`);
        return false;
      }

      // Validate each rule has required fields
      const validRules = rules.every(rule =>
        rule.id &&
        isValidText(rule.text) &&
        isValidColour(rule.colour) &&
        typeof rule.enabled === 'boolean' &&
        typeof rule.order === 'number'
      );

      if (!validRules) {
        console.error('Live Highlighter: Invalid rule structure');
        return false;
      }

      await chrome.storage.local.set({ [STORAGE_KEYS.RULES]: rules });
      return true;
    } catch (error) {
      console.error('Live Highlighter: Error saving rules', error);
      return false;
    }
  }

  /**
   * Get global enabled state
   * @returns {Promise<boolean>} Whether highlighting is enabled
   */
  async function getEnabled()
  {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.ENABLED);
      return result[STORAGE_KEYS.ENABLED] !== undefined
        ? result[STORAGE_KEYS.ENABLED]
        : DEFAULT_SETTINGS.enabled;
    } catch (error) {
      console.error('Live Highlighter: Error getting enabled state', error);
      return DEFAULT_SETTINGS.enabled;
    }
  }

  /**
   * Set global enabled state
   * @param {boolean} enabled - Whether highlighting should be enabled
   * @returns {Promise<boolean>} Success status
   */
  async function setEnabled(enabled)
  {
    try {
      if (typeof enabled !== 'boolean') {
        console.error('Live Highlighter: setEnabled requires a boolean');
        return false;
      }

      await chrome.storage.local.set({ [STORAGE_KEYS.ENABLED]: enabled });
      return true;
    } catch (error) {
      console.error('Live Highlighter: Error setting enabled state', error);
      return false;
    }
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Generate a unique ID for a rule
   * @returns {string} UUID v4
   */
  function generateId()
  {
    return crypto.randomUUID();
  }

  /**
   * Initialize storage with default values
   * @returns {Promise<boolean>} Success status
   */
  async function initializeStorage()
  {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.RULES,
        STORAGE_KEYS.ENABLED,
        STORAGE_KEYS.VERSION
      ]);

      // Only initialize if not already set
      if (result[STORAGE_KEYS.VERSION] === undefined) {
        await chrome.storage.local.set(DEFAULT_SETTINGS);
        console.log('Live Highlighter: Storage initialized with defaults');
      }

      return true;
    } catch (error) {
      console.error('Live Highlighter: Error initializing storage', error);
      return false;
    }
  }

  // ============================================================================
  // Convenience Functions for Rule Management
  // ============================================================================

  /**
   * Add a new rule
   * @param {string} text - Text to highlight
   * @param {string} colour - Hex colour code
   * @returns {Promise<object|null>} The new rule object or null if failed
   */
  async function addRule(text, colour)
  {
    try {
      // Validate input
      if (!isValidText(text)) {
        console.warn('Live Highlighter: Rule text cannot be empty');
        return null;
      }

      if (!isValidColour(colour)) {
        console.warn('Live Highlighter: Invalid colour - must be from preset list');
        return null;
      }

      const rules = await getRules();

      // Check if we've hit the limit
      if (rules.length >= MAX_RULES) {
        console.warn(`Live Highlighter: Maximum ${MAX_RULES} rules reached`);
        return null;
      }

      const trimmedText = text.trim();

      // Check for duplicate text
      if (rules.some(rule => rule.text.toLowerCase() === trimmedText.toLowerCase())) {
        console.warn('Live Highlighter: Duplicate rule text');
        return null;
      }

      // Find textColor from preset colors
      const preset = PRESET_COLOURS.find(p => p.hex === colour);
      const textColor = preset ? preset.textColor : '#000000'; // Default to black if not found

      // Create new rule
      const newRule = {
        id: generateId(),
        text: trimmedText,
        colour: colour,
        textColor: textColor,
        enabled: true,
        order: rules.length  // Add to end
      };

      rules.push(newRule);
      const success = await saveRules(rules);

      return success ? newRule : null;
    } catch (error) {
      console.error('Live Highlighter: Error adding rule', error);
      return null;
    }
  }

  /**
   * Update an existing rule
   * @param {string} id - Rule ID
   * @param {object} updates - Fields to update (only text, colour, enabled, order allowed)
   * @returns {Promise<boolean>} Success status
   */
  async function updateRule(id, updates)
  {
    try {
      const rules = await getRules();
      const index = rules.findIndex(rule => rule.id === id);

      if (index === -1) {
        console.warn('Live Highlighter: Rule not found');
        return false;
      }

      // Whitelist allowed fields to prevent id tampering
      const allowedFields = ['text', 'colour', 'enabled', 'order'];
      const validUpdates = {};

      for (const field of allowedFields) {
        if (updates.hasOwnProperty(field)) {
          validUpdates[field] = updates[field];
        }
      }

      // Validate updated values
      if (validUpdates.text !== undefined && !isValidText(validUpdates.text)) {
        console.warn('Live Highlighter: Invalid text in update');
        return false;
      }

      if (validUpdates.colour !== undefined && !isValidColour(validUpdates.colour)) {
        console.warn('Live Highlighter: Invalid colour in update');
        return false;
      }

      if (validUpdates.enabled !== undefined && typeof validUpdates.enabled !== 'boolean') {
        console.warn('Live Highlighter: Invalid enabled value in update');
        return false;
      }

      if (validUpdates.order !== undefined && typeof validUpdates.order !== 'number') {
        console.warn('Live Highlighter: Invalid order value in update');
        return false;
      }

      // Apply validated updates
      rules[index] = { ...rules[index], ...validUpdates };

      return await saveRules(rules);
    } catch (error) {
      console.error('Live Highlighter: Error updating rule', error);
      return false;
    }
  }

  /**
   * Delete a rule
   * @param {string} id - Rule ID
   * @returns {Promise<boolean>} Success status
   */
  async function deleteRule(id)
  {
    try {
      const rules = await getRules();
      const filtered = rules.filter(rule => rule.id !== id);

      if (filtered.length === rules.length) {
        console.warn('Live Highlighter: Rule not found');
        return false;
      }

      // Reorder remaining rules
      filtered.forEach((rule, index) =>
      {
        rule.order = index;
      });

      return await saveRules(filtered);
    } catch (error) {
      console.error('Live Highlighter: Error deleting rule', error);
      return false;
    }
  }

  /**
   * Reorder rules
   * @param {Array<string>} orderedIds - Array of rule IDs in desired order
   * @returns {Promise<boolean>} Success status
   */
  async function reorderRules(orderedIds)
  {
    try {
      const rules = await getRules();

      // Create a map for quick lookup
      const ruleMap = new Map(rules.map(rule => [rule.id, rule]));

      // Build new array in specified order
      const reordered = orderedIds
        .map(id => ruleMap.get(id))
        .filter(rule => rule !== undefined);

      // Verify all rules are accounted for
      if (reordered.length !== rules.length) {
        console.warn('Live Highlighter: Invalid rule order');
        return false;
      }

      // Update order field
      reordered.forEach((rule, index) =>
      {
        rule.order = index;
      });

      return await saveRules(reordered);
    } catch (error) {
      console.error('Live Highlighter: Error reordering rules', error);
      return false;
    }
  }

  /**
   * Get a single rule by ID
   * @param {string} id - Rule ID
   * @returns {Promise<object|null>} Rule object or null if not found
   */
  async function getRule(id)
  {
    try {
      const rules = await getRules();
      const rule = rules.find(rule => rule.id === id);
      // Return a copy to prevent mutation
      return rule ? { ...rule } : null;
    } catch (error) {
      console.error('Live Highlighter: Error getting rule', error);
      return null;
    }
  }

  /**
   * Clear all rules
   * @returns {Promise<boolean>} Success status
   */
  async function clearAllRules()
  {
    try {
      return await saveRules([]);
    } catch (error) {
      console.error('Live Highlighter: Error clearing rules', error);
      return false;
    }
  }

  // ============================================================================
  // Storage Change Listener
  // ============================================================================

  /**
   * Listen for storage changes
   * @param {function} callback - Called when storage changes with (changes, area)
   */
  function onStorageChanged(callback)
  {
    chrome.storage.onChanged.addListener((changes, area) =>
    {
      if (area === 'local') {
        callback(changes, area);
      }
    });
  }

  // ============================================================================
  // Public API
  // ============================================================================

  return {
    // Core functions
    getRules,
    saveRules,
    getEnabled,
    setEnabled,
    initializeStorage,

    // Rule management
    addRule,
    updateRule,
    deleteRule,
    reorderRules,
    getRule,
    clearAllRules,

    // Listeners
    onStorageChanged,

    // Utilities (exposed for testing/advanced use)
    generateId,
    isValidColour,
    isValidText
  };
})();

console.log('Live Highlighter: Storage module loaded');
