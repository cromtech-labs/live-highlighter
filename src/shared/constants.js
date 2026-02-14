// Live Highlighter - Constants and Configuration

// Namespace to avoid scope pollution
const LiveHighlighter = (function ()
{
  'use strict';

  return {
    // Maximum limits (free tier)
    MAX_GROUPS: 10,              // Maximum number of groups
    MAX_WORDS_PER_GROUP: 20,     // Maximum words per group
    MAX_TOTAL_WORDS: 200,        // Maximum total words across all groups

    // Preset colour options (free tier)
    // WCAG AA compliant colors optimized for light backgrounds with black text
    // Uses lighter tints for better readability and colorblind accessibility
    // Material Design 100-300 shades verified for accessibility with black text
    PRESET_COLOURS: [
      { name: 'Yellow', hex: '#FFF59D', textColor: '#000000' },      // Light yellow - WCAG AA compliant
      { name: 'Orange', hex: '#FFCC80', textColor: '#000000' },      // Light orange - high contrast
      { name: 'Cyan', hex: '#80DEEA', textColor: '#000000' },        // Light cyan - distinct from yellow
      { name: 'Pink', hex: '#F48FB1', textColor: '#000000' },        // Light pink - colorblind friendly
      { name: 'Green', hex: '#A5D6A7', textColor: '#000000' },       // Light green - accessible
      { name: 'Lavender', hex: '#CE93D8', textColor: '#000000' },    // Light purple - good contrast
      { name: 'Blue', hex: '#BBDEFB', textColor: '#000000' },        // Material Blue 100 - distinct from cyan
      { name: 'Peach', hex: '#FFCCBC', textColor: '#000000' },       // Material Deep Orange 100 - distinct from orange
      { name: 'Teal', hex: '#B2DFDB', textColor: '#000000' },        // Material Teal 100 - distinct blue-green
      { name: 'Indigo', hex: '#C5CAE9', textColor: '#000000' }       // Material Indigo 100 - distinct blue-purple
    ],

    // Default group for new installs
    DEFAULT_GROUP: {
      name: 'Example Group',
      colour: '#FFF59D',
      textColor: '#000000',
      enabled: true,
      words: ['Important', 'TODO', 'URGENT']
    },

    // Storage keys
    STORAGE_KEYS: {
      GROUPS: 'groups',
      ENABLED: 'enabled',
      VERSION: 'version'
    },

    // Default settings
    DEFAULT_SETTINGS: {
      groups: [],  // Will be populated with DEFAULT_GROUP on first install
      enabled: true,
      version: 2   // Bumped version to indicate new schema
    },

    // MutationObserver debounce delay (ms)
    MUTATION_DEBOUNCE_MS: 150,

    // Notification auto-dismiss timeout (ms)
    NOTIFICATION_TIMEOUT_MS: 10000,  // 10 seconds

    // Elements to skip when highlighting
    SKIP_ELEMENTS: ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT'],

    // CSS Highlight API prefix (for CSS.highlights registry)
    // "lh" = Live Highlighter
    HIGHLIGHT_PREFIX: 'lh',

    // Active highlight for navigation (painted on top of regular highlights)
    ACTIVE_HIGHLIGHT_NAME: 'lh-active',
    ACTIVE_HIGHLIGHT_COLOR: '#FFAB40',
    ACTIVE_HIGHLIGHT_TEXT_COLOR: '#000000',

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
