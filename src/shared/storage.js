// Live Highlighter - Storage Abstraction Layer (Groups Architecture)

/**
 * Group object schema:
 * {
 *   id: string,             // UUID
 *   name: string,           // Group name (e.g., "Team Names")
 *   colour: string,         // Hex colour for all words in group
 *   textColor: string,      // Text color for readability
 *   enabled: boolean,       // Per-group toggle
 *   order: number,          // Priority (lower = higher priority)
 *   words: string[],        // Array of words to highlight
 *   matchWholeWord: boolean,// Match whole words only (default: false)
 *   caseSensitive: boolean  // Case sensitive matching (default: false)
 * }
 */

// Extend LiveHighlighter namespace with storage functions
LiveHighlighter.Storage = (function ()
{
  'use strict';

  // Shorthand references to constants
  const {
    MAX_GROUPS,
    MAX_WORDS_PER_GROUP,
    MAX_TOTAL_WORDS,
    PRESET_COLOURS,
    DEFAULT_GROUP,
    STORAGE_KEYS,
    DEFAULT_SETTINGS
  } = LiveHighlighter;

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
    if (typeof colour !== 'string') return false;
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(colour);
  }

  /**
   * Validate if group name is valid
   * @param {string} name - Group name
   * @returns {boolean}
   */
  function isValidGroupName(name)
  {
    return typeof name === 'string' && name.trim().length > 0 && name.length <= 50;
  }

  /**
   * Validate if word is valid
   * @param {string} word - Word to validate
   * @returns {boolean}
   */
  function isValidWord(word)
  {
    return typeof word === 'string' && word.trim().length > 0 && word.length <= 100;
  }

  /**
   * Validate if words array is valid
   * @param {Array<string>} words - Array of words
   * @returns {boolean}
   */
  function isValidWordsArray(words)
  {
    return Array.isArray(words) &&
           words.length <= MAX_WORDS_PER_GROUP &&
           words.every(isValidWord);
  }

  // ============================================================================
  // Core Storage Functions
  // ============================================================================

  /**
   * Get all groups from storage
   * @returns {Promise<Array>} Array of group objects
   */
  async function getGroups()
  {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.GROUPS);
      // Return a copy to prevent mutation of stored data
      const groups = result[STORAGE_KEYS.GROUPS];
      return groups ? JSON.parse(JSON.stringify(groups)) : [];
    } catch (error) {
      console.error('Live Highlighter: Error getting groups', error);
      return [];
    }
  }

  /**
   * Save groups to storage
   * @param {Array} groups - Array of group objects
   * @returns {Promise<boolean>} Success status
   */
  async function saveGroups(groups)
  {
    try {
      // Validate groups array
      if (!Array.isArray(groups)) {
        console.error('Live Highlighter: saveGroups requires an array');
        return false;
      }

      // Enforce MAX_GROUPS limit
      if (groups.length > MAX_GROUPS) {
        console.warn(`Live Highlighter: Cannot save more than ${MAX_GROUPS} groups`);
        return false;
      }

      // Enforce total word count limit
      const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);
      if (totalWords > MAX_TOTAL_WORDS) {
        console.warn(`Live Highlighter: Cannot save more than ${MAX_TOTAL_WORDS} words total`);
        return false;
      }

      // Validate each group has required fields
      const validGroups = groups.every(group =>
        group.id &&
        isValidGroupName(group.name) &&
        isValidColour(group.colour) &&
        isValidColour(group.textColor) &&
        typeof group.enabled === 'boolean' &&
        typeof group.order === 'number' &&
        isValidWordsArray(group.words)
      );

      if (!validGroups) {
        console.error('Live Highlighter: Invalid group structure');
        return false;
      }

      await chrome.storage.local.set({ [STORAGE_KEYS.GROUPS]: groups });
      return true;
    } catch (error) {
      console.error('Live Highlighter: Error saving groups', error);
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
   * Generate a unique ID for a group
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
        STORAGE_KEYS.GROUPS,
        STORAGE_KEYS.ENABLED,
        STORAGE_KEYS.VERSION
      ]);

      // Only initialize if not already set
      if (result[STORAGE_KEYS.VERSION] === undefined) {
        // Create default group with sample words
        const defaultGroup = {
          id: generateId(),
          name: DEFAULT_GROUP.name,
          colour: DEFAULT_GROUP.colour,
          textColor: DEFAULT_GROUP.textColor,
          enabled: DEFAULT_GROUP.enabled,
          order: 0,
          words: [...DEFAULT_GROUP.words],
          matchWholeWord: false,
          caseSensitive: false
        };

        await chrome.storage.local.set({
          [STORAGE_KEYS.GROUPS]: [defaultGroup],
          [STORAGE_KEYS.ENABLED]: DEFAULT_SETTINGS.enabled,
          [STORAGE_KEYS.VERSION]: DEFAULT_SETTINGS.version
        });

        console.log('Live Highlighter: Storage initialized with default group');
      }

      return true;
    } catch (error) {
      console.error('Live Highlighter: Error initializing storage', error);
      return false;
    }
  }

  // ============================================================================
  // Group Management Functions
  // ============================================================================

  /**
   * Add a new group
   * @param {string} name - Group name
   * @param {string} colour - Hex colour code
   * @returns {Promise<object|null>} The new group object or null if failed
   */
  async function addGroup(name, colour)
  {
    try {
      // Validate input
      if (!isValidGroupName(name)) {
        console.warn('Live Highlighter: Group name is invalid');
        return null;
      }

      if (!isValidColour(colour)) {
        console.warn('Live Highlighter: Invalid colour');
        return null;
      }

      const groups = await getGroups();

      // Check if we've hit the group limit
      if (groups.length >= MAX_GROUPS) {
        console.warn(`Live Highlighter: Maximum ${MAX_GROUPS} groups reached`);
        return null;
      }

      const trimmedName = name.trim();

      // Find textColor from preset colors
      const preset = PRESET_COLOURS.find(p => p.hex === colour);
      const textColor = preset ? preset.textColor : '#000000';

      // Create new group
      const newGroup = {
        id: generateId(),
        name: trimmedName,
        colour: colour,
        textColor: textColor,
        enabled: true,
        order: groups.length,  // Add to end
        words: [],  // Start with empty words array
        matchWholeWord: false,  // Default: partial matching
        caseSensitive: false    // Default: case-insensitive
      };

      groups.push(newGroup);
      const success = await saveGroups(groups);

      return success ? newGroup : null;
    } catch (error) {
      console.error('Live Highlighter: Error adding group', error);
      return null;
    }
  }

  /**
   * Update an existing group
   * @param {string} id - Group ID
   * @param {object} updates - Fields to update (name, colour, enabled, order, words allowed)
   * @returns {Promise<boolean>} Success status
   */
  async function updateGroup(id, updates)
  {
    try {
      const groups = await getGroups();
      const index = groups.findIndex(group => group.id === id);

      if (index === -1) {
        console.warn('Live Highlighter: Group not found');
        return false;
      }

      // Whitelist allowed fields to prevent id tampering
      const allowedFields = ['name', 'colour', 'textColor', 'enabled', 'order', 'words', 'matchWholeWord', 'caseSensitive'];
      const validUpdates = {};

      for (const field of allowedFields) {
        if (updates.hasOwnProperty(field)) {
          validUpdates[field] = updates[field];
        }
      }

      // Validate updated values
      if (validUpdates.name !== undefined && !isValidGroupName(validUpdates.name)) {
        console.warn('Live Highlighter: Invalid name in update');
        return false;
      }

      if (validUpdates.colour !== undefined && !isValidColour(validUpdates.colour)) {
        console.warn('Live Highlighter: Invalid colour in update');
        return false;
      }

      if (validUpdates.textColor !== undefined && !isValidColour(validUpdates.textColor)) {
        console.warn('Live Highlighter: Invalid textColor in update');
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

      if (validUpdates.words !== undefined && !isValidWordsArray(validUpdates.words)) {
        console.warn('Live Highlighter: Invalid words array in update');
        return false;
      }

      if (validUpdates.matchWholeWord !== undefined && typeof validUpdates.matchWholeWord !== 'boolean') {
        console.warn('Live Highlighter: Invalid matchWholeWord value in update');
        return false;
      }

      if (validUpdates.caseSensitive !== undefined && typeof validUpdates.caseSensitive !== 'boolean') {
        console.warn('Live Highlighter: Invalid caseSensitive value in update');
        return false;
      }

      // Apply validated updates
      groups[index] = { ...groups[index], ...validUpdates };

      return await saveGroups(groups);
    } catch (error) {
      console.error('Live Highlighter: Error updating group', error);
      return false;
    }
  }

  /**
   * Delete a group
   * @param {string} id - Group ID
   * @returns {Promise<boolean>} Success status
   */
  async function deleteGroup(id)
  {
    try {
      const groups = await getGroups();
      const filtered = groups.filter(group => group.id !== id);

      if (filtered.length === groups.length) {
        console.warn('Live Highlighter: Group not found');
        return false;
      }

      // Reorder remaining groups
      filtered.forEach((group, index) =>
      {
        group.order = index;
      });

      return await saveGroups(filtered);
    } catch (error) {
      console.error('Live Highlighter: Error deleting group', error);
      return false;
    }
  }

  /**
   * Reorder groups
   * @param {Array<string>} orderedIds - Array of group IDs in desired order
   * @returns {Promise<boolean>} Success status
   */
  async function reorderGroups(orderedIds)
  {
    try {
      const groups = await getGroups();

      // Create a map for quick lookup
      const groupMap = new Map(groups.map(group => [group.id, group]));

      // Build new array in specified order
      const reordered = orderedIds
        .map(id => groupMap.get(id))
        .filter(group => group !== undefined);

      // Verify all groups are accounted for
      if (reordered.length !== groups.length) {
        console.warn('Live Highlighter: Invalid group order');
        return false;
      }

      // Update order field
      reordered.forEach((group, index) =>
      {
        group.order = index;
      });

      return await saveGroups(reordered);
    } catch (error) {
      console.error('Live Highlighter: Error reordering groups', error);
      return false;
    }
  }

  /**
   * Get a single group by ID
   * @param {string} id - Group ID
   * @returns {Promise<object|null>} Group object or null if not found
   */
  async function getGroup(id)
  {
    try {
      const groups = await getGroups();
      const group = groups.find(group => group.id === id);
      // Return a copy to prevent mutation
      return group ? JSON.parse(JSON.stringify(group)) : null;
    } catch (error) {
      console.error('Live Highlighter: Error getting group', error);
      return null;
    }
  }

  /**
   * Clear all groups
   * @returns {Promise<boolean>} Success status
   */
  async function clearAllGroups()
  {
    try {
      return await saveGroups([]);
    } catch (error) {
      console.error('Live Highlighter: Error clearing groups', error);
      return false;
    }
  }

  // ============================================================================
  // Word Management Functions (NEW)
  // ============================================================================

  /**
   * Add a word to a specific group
   * @param {string} groupId - Group ID
   * @param {string} word - Word to add
   * @returns {Promise<boolean>} Success status
   */
  async function addWordToGroup(groupId, word)
  {
    try {
      if (!isValidWord(word)) {
        console.warn('Live Highlighter: Invalid word');
        return false;
      }

      const groups = await getGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        console.warn('Live Highlighter: Group not found');
        return false;
      }

      // Check group word limit
      if (group.words.length >= MAX_WORDS_PER_GROUP) {
        console.warn(`Live Highlighter: Maximum ${MAX_WORDS_PER_GROUP} words per group reached`);
        return false;
      }

      // Check total word limit
      const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);
      if (totalWords >= MAX_TOTAL_WORDS) {
        console.warn(`Live Highlighter: Maximum ${MAX_TOTAL_WORDS} total words reached`);
        return false;
      }

      const trimmedWord = word.trim();

      // Check for duplicate in this group (case-insensitive)
      if (group.words.some(w => w.toLowerCase() === trimmedWord.toLowerCase())) {
        console.warn('Live Highlighter: Duplicate word in group');
        return false;
      }

      // Add word to group
      group.words.push(trimmedWord);

      return await saveGroups(groups);
    } catch (error) {
      console.error('Live Highlighter: Error adding word to group', error);
      return false;
    }
  }

  /**
   * Remove a word from a specific group
   * @param {string} groupId - Group ID
   * @param {string} word - Word to remove
   * @returns {Promise<boolean>} Success status
   */
  async function removeWordFromGroup(groupId, word)
  {
    try {
      const groups = await getGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        console.warn('Live Highlighter: Group not found');
        return false;
      }

      // Remove word (case-insensitive)
      const initialLength = group.words.length;
      group.words = group.words.filter(w => w.toLowerCase() !== word.toLowerCase());

      if (group.words.length === initialLength) {
        console.warn('Live Highlighter: Word not found in group');
        return false;
      }

      return await saveGroups(groups);
    } catch (error) {
      console.error('Live Highlighter: Error removing word from group', error);
      return false;
    }
  }

  /**
   * Update a word within a group
   * @param {string} groupId - Group ID
   * @param {string} oldWord - Word to replace
   * @param {string} newWord - New word
   * @returns {Promise<boolean>} Success status
   */
  async function updateWordInGroup(groupId, oldWord, newWord)
  {
    try {
      if (!isValidWord(newWord)) {
        console.warn('Live Highlighter: Invalid new word');
        return false;
      }

      const groups = await getGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        console.warn('Live Highlighter: Group not found');
        return false;
      }

      // Find word index (case-insensitive)
      const index = group.words.findIndex(w => w.toLowerCase() === oldWord.toLowerCase());

      if (index === -1) {
        console.warn('Live Highlighter: Word not found in group');
        return false;
      }

      const trimmedNewWord = newWord.trim();

      // Check for duplicate (case-insensitive, excluding current word)
      const duplicate = group.words.some((w, i) =>
        i !== index && w.toLowerCase() === trimmedNewWord.toLowerCase()
      );

      if (duplicate) {
        console.warn('Live Highlighter: Duplicate word in group');
        return false;
      }

      // Update word
      group.words[index] = trimmedNewWord;

      return await saveGroups(groups);
    } catch (error) {
      console.error('Live Highlighter: Error updating word in group', error);
      return false;
    }
  }

  /**
   * Get total word count across all groups
   * @returns {Promise<number>} Total word count
   */
  async function getTotalWordCount()
  {
    try {
      const groups = await getGroups();
      return groups.reduce((sum, g) => sum + g.words.length, 0);
    } catch (error) {
      console.error('Live Highlighter: Error getting total word count', error);
      return 0;
    }
  }

  /**
   * Check if a word can be added to a group
   * @param {string} groupId - Group ID
   * @returns {Promise<boolean>} Whether word can be added
   */
  async function canAddWord(groupId)
  {
    try {
      const groups = await getGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) return false;

      // Check group word limit
      if (group.words.length >= MAX_WORDS_PER_GROUP) {
        return false;
      }

      // Check total word limit
      const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);
      if (totalWords >= MAX_TOTAL_WORDS) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Live Highlighter: Error checking if word can be added', error);
      return false;
    }
  }

  /**
   * Check if a group can be added
   * @returns {Promise<boolean>} Whether group can be added
   */
  async function canAddGroup()
  {
    try {
      const groups = await getGroups();
      return groups.length < MAX_GROUPS;
    } catch (error) {
      console.error('Live Highlighter: Error checking if group can be added', error);
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
    getGroups,
    saveGroups,
    getEnabled,
    setEnabled,
    initializeStorage,

    // Group management
    addGroup,
    updateGroup,
    deleteGroup,
    reorderGroups,
    getGroup,
    clearAllGroups,

    // Word management
    addWordToGroup,
    removeWordFromGroup,
    updateWordInGroup,
    getTotalWordCount,
    canAddWord,
    canAddGroup,

    // Listeners
    onStorageChanged,

    // Utilities (exposed for testing/advanced use)
    generateId,
    isValidColour,
    isValidGroupName,
    isValidWord
  };
})();

console.log('Live Highlighter: Storage module loaded (Groups Architecture)');
