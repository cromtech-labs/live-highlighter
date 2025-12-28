# Changelog

All notable changes to Live Highlighter will be documented in this file.

---

## [0.3.0] - 2025-12-28

### Added
- **Visual feedback for word limits** - Input and button are now disabled when a group reaches 20 words, with red word count indicator
- **Toast notification system** - User-friendly toast notifications replace console logging for all user actions
- **Skipped words notification** - Clear feedback when words cannot be added due to limits, showing which words were skipped
- **Expanded color palette** - Increased from 6 to 10 WCAG AA compliant colors (added Teal, Indigo, Blue, Peach)
- **Light/dark mode toggle** - All test pages now support theme switching to test highlight colors in both modes
- **Pull request template** - Added comprehensive PR template with version and changelog checklist

### Changed
- **Notification timeout** - Centralized in `constants.js` (default: 10 seconds) for consistent auto-dismiss behavior
- **Color accessibility** - Replaced Material Design 200 shades with lighter 100 shades for better WCAG AA compliance
- **Notification behavior** - All notifications auto-dismiss after configurable timeout (previously errors required manual dismissal)

### Fixed
- Silent failures when exceeding word limits now provide clear user feedback

---

## [0.2.0] - 2025-12-27

### Added
- **Groups architecture** - Migrated from individual word lists to groups containing multiple words for better organization
- **Additional test pages** - Expanded test suite with new scenarios
- **Multi-document highlighting** - Support for highlighting text in same-origin iframes (including `document.write()` iframes)

### Changed
- **Single source of truth for colors** - Consolidated all color definitions to `PRESET_COLOURS` in `constants.js`
- **Dynamic CSS generation** - Removed `content.css`, all styles now generated dynamically from constants
- **Architecture refactoring** - Highlighting functions refactored for multi-document context support

### Fixed
- Toggle slider animation in options page
- Iframe highlighting for dynamically created iframes

---

## [0.1.0] - 2025-12-24

### Initial Release

**Status:** Beta - Open for feedback

This is the first public release of Live Highlighter. The extension allows you to highlight user-defined strings on any webpage with configurable colours.

**Feedback Welcome:**
We're actively seeking feedback to improve the extension. Please report bugs or suggest features on our [GitHub Issues](https://github.com/cromtech-labs/live-highlighter/issues) page.

---
