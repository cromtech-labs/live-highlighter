# Changelog

All notable changes to Live Highlighter will be documented in this file.

---

## [0.9.0] - 2026-02-14

### Added
- **Highlight navigation** - Previous/Next buttons in the popup to cycle through all highlights on the page
  - Active highlight styled with orange background, black text, and blue underline for clear visibility
  - Page smoothly scrolls to off-screen highlights (skips scroll if already in viewport)
  - Position indicator shows current index and total count (e.g., "3 / 42") with matched text
  - Navigation wraps around at both ends
- **Stale range pruning** - New `pruneStaleRanges()` function removes detached text nodes from `rangeCache` and `CSS.highlights`, keeping counts accurate on dynamic pages

### Fixed
- **Options page event listener leak** - `renderWords()` now clones both the add-word button and input element to prevent stale closures from accumulating on repeated renders
- **Options page color dropdown leak** - Document-level click handler for closing color dropdowns is now registered once at init instead of per-group on every render
- **Service worker error handling** - Added `.catch()` handlers to all async message responses (`GET_GROUPS`, `GET_ENABLED`, `TOGGLE_ENABLED`)
- **Content script async messaging** - `STORAGE_CHANGED` handler now properly returns `true` to keep the message channel open for the async response
- **Inconsistent highlight counts** - Popup now uses content script message instead of `chrome.scripting.executeScript`, making the count consistent with navigation total (single source of truth)

### Technical
- Added `ACTIVE_HIGHLIGHT_NAME`, `ACTIVE_HIGHLIGHT_COLOR`, `ACTIVE_HIGHLIGHT_TEXT_COLOR` constants
- Active highlight uses CSS Highlight API `priority: 1000` to paint on top of regular highlights
- Navigation only covers main document ranges (cross-document `Range.compareBoundaryPoints` throws)
- Added `navSequence` counter in popup to prevent stale async responses from overwriting newer state
- Added `navScrolling` flag to suppress scroll-based re-highlight during smooth scroll animations
- Added `navPrevious`, `navNext`, `navPositionTooltip` i18n strings to all 8 locale files
- Updated tests README with regex group test instructions

---

## [0.8.0] - 2026-02-06

### Added
- **Regex matching** - New per-group "Regex" checkbox to use regular expressions for matching
  - Supports full JavaScript regex syntax (alternation, character classes, quantifiers, etc.)
  - Invalid regex patterns are silently skipped (no crashes)
  - Zero-length matches are safely handled (no infinite loops)
  - When enabled, "Match whole word" and "Case sensitive" checkboxes are disabled (these can be expressed within the regex itself)
- **Regex info link** - Info icon next to the Regex checkbox linking to [regexr.com](https://regexr.com/) for learning/testing patterns
- **Regex test page** - New `tests/regex.html` with comprehensive test cases for regex matching

### Changed
- **Match option labels** - "Match whole words only" shortened to "Match whole word" for consistency
- **Checkbox order** - Reordered match options: Match whole word → Case sensitive → Regex

### Technical
- Added `useRegex` boolean field to group schema (default: false, backward compatible)
- Updated `flattenGroupsToRules` to pass `useRegex` from groups to rules
- Added regex matching branch in `highlightTextNode` alongside existing substring matching
- Updated storage validation and `allowedFields` whitelist for `useRegex`
- Added `useRegex` i18n string to all 8 locale files
- Added `.match-option.disabled` CSS for greyed-out checkboxes

---

## [0.7.0] - 2025-01-29

### Added
- **Internationalization (i18n)** - Full translation support for 8 languages:
  - English (en)
  - Spanish (es)
  - French (fr)
  - German (de)
  - Portuguese - Brazil (pt_BR)
  - Chinese - Simplified (zh_CN)
  - Japanese (ja)
  - Korean (ko)
- **i18n helper module** - New `src/shared/i18n.js` with `getMessage()` and `applyTranslations()` utilities
- **Translated UI elements** - All user-facing text including:
  - Labels and headers
  - Button text
  - Placeholder text
  - Notification messages
  - Confirmation dialogs
  - Tooltips and aria-labels
  - Dynamic content (word counts, group counts, default group names)

### Fixed
- **Group collapse bug** - Groups no longer collapse after adding words (fixed expandedGroupIds tracking for new groups)
- **New group name input** - Fixed selector error when auto-focusing name input on new group creation

### Technical
- Added `default_locale: "en"` to manifest.json
- HTML elements use `data-i18n`, `data-i18n-placeholder`, and `data-i18n-title` attributes
- Manifest uses `__MSG_appName__` and `__MSG_appDescription__` placeholders

---

## [0.6.0] - 2025-01-29

### Changed
- **Options page updates** - Cleaner, modern layout with improved visual hierarchy
- **Popup terminology** - Updated to use "Groups" consistently
  - "Manage Rules" → "Manage Groups"
  - "Highlighting" → "Highlighting Enabled" (matches options page)
  - Welcome banner updated to reference "groups" instead of "rules"
- **Popup status section** - Simplified styling with cleaner divider-based layout

### Fixed
- **Popup groups count bug** - "Groups Active" now correctly shows group count (e.g., "5 / 7") instead of incorrectly displaying word count

---

## [0.5.0] - 2025-12-28

### Added
- **Whole word matching option** - New "Match whole words only" checkbox per group to match complete words instead of partial matches (e.g., "error" won't match "errors")
- **Case sensitive matching option** - New "Case sensitive" checkbox per group to enable exact case matching (e.g., "Error" won't match "error")
- **Match options UI** - Added checkbox controls in expanded group section with clear labels and styling

### Changed
- **Group schema updated** - Added `matchWholeWord` and `caseSensitive` boolean fields to group objects (default: false for backward compatibility)
- **Highlighting algorithm enhanced** - Word boundary detection using regex for whole word matching, conditional case sensitivity
- **Storage validation** - Updated group validation to include new match option fields

### Technical
- Updated `flattenGroupsToRules` to pass through match options from groups to individual rules
- Enhanced `highlightTextNode` with word boundary checking and conditional case conversion
- Added `isWordBoundary` helper function for accurate word boundary detection

---

## [0.4.0] - 2025-12-28

### Added
- **Horizontal padding in groups** - Added 20px left/right padding inside group headers and word sections for better content spacing
- **Vertical spacing between groups** - Added 16px gap between groups for improved visual separation and readability
- **Clickable group headers** - Entire group header is now clickable with visual affordances (hover states, pointer cursor)

### Changed
- **Chevron icon repositioned** - Moved expand/collapse chevron to left side of group header for better UX consistency
- **Improved color distinction** - Replaced Lime with Teal and Purple with Indigo for better visual differentiation between highlight colors

### Fixed
- **Container corner overflow** - Fixed rounded corners being cut off on group items
- **Flexbox layout bug** - Fixed JavaScript display property override that prevented gap spacing from working
- **Edge spacing** - Groups no longer extend flush to container edges

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
