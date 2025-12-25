// Live Highlighter - Constants and Configuration

// Namespace to avoid scope pollution
const LiveHighlighter = (function ()
{
  'use strict';

  return {
    // Maximum number of rules (free tier limit)
    MAX_RULES: 6,

    // Preset colour options (free tier)
    // WCAG AA compliant colors optimized for light backgrounds with black text
    // Uses lighter tints for better readability and colorblind accessibility
    PRESET_COLOURS: [
      { name: 'Yellow', hex: '#FFF59D', textColor: '#000000' },      // Light yellow - WCAG AA compliant
      { name: 'Orange', hex: '#FFCC80', textColor: '#000000' },      // Light orange - high contrast
      { name: 'Cyan', hex: '#80DEEA', textColor: '#000000' },        // Light cyan - distinct from yellow
      { name: 'Pink', hex: '#F48FB1', textColor: '#000000' },        // Light pink - colorblind friendly
      { name: 'Green', hex: '#A5D6A7', textColor: '#000000' },       // Light green - accessible
      { name: 'Lavender', hex: '#CE93D8', textColor: '#000000' }     // Light purple - good contrast
    ],

    // Default rules (empty on first install)
    DEFAULT_RULES: [],

    // Storage keys
    STORAGE_KEYS: {
      RULES: 'rules',
      ENABLED: 'enabled',
      VERSION: 'version'
    },

    // Default settings
    DEFAULT_SETTINGS: {
      rules: [],  // Empty array, not reference to DEFAULT_RULES
      enabled: true,
      version: 1
    },

    // MutationObserver debounce delay (ms)
    MUTATION_DEBOUNCE_MS: 150,

    // Elements to skip when highlighting
    SKIP_ELEMENTS: ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT'],

    // CSS Highlight API prefix (for CSS.highlights registry)
    // "lh" = Live Highlighter
    HIGHLIGHT_PREFIX: 'lh',

    // Map of color hex to highlight name for CSS Highlight API
    getHighlightName(colourHex)
    {
      const colour = this.PRESET_COLOURS.find(c => c.hex === colourHex);
      if (!colour) return null;
      return `${this.HIGHLIGHT_PREFIX}-${colour.name.toLowerCase()}`;
    }
  };
})();

console.log('Live Highlighter: Constants loaded');
