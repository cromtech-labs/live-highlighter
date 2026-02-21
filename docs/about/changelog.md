# Changelog

All notable changes to Live Highlighter are documented here.

## [0.11.0] - 2026-02-22

### Added
- **Documentation site** - Published docs at [docs.livehighlighter.com](https://docs.livehighlighter.com/) covering all current features, groups architecture, matching options, changelog, and FAQ
- **Uninstall feedback page** - Opens automatically when the extension is uninstalled, with a short feedback form to capture why users leave

---

## [0.10.0] - 2026-02-21

### Added
- **Welcome page** — Opens automatically on first install with a step-by-step setup guide, tips, and a direct link to the options page

### Changed
- **Options page accessibility** — Full ARIA audit: toggles are now `<button role="switch">`, colour picker has full keyboard navigation (arrow keys, Escape), expand/collapse tracks `aria-expanded`, delete buttons have descriptive `aria-label` values
- **Options page layout** — Matching options collapsed under a `<details>` by default; drag handle hidden with only one group; edit pencil always subtly visible; help section auto-hides once words are added; delete button visually separated
- **Options page behaviour** — Single empty group auto-expands on first load; default group starts with no sample words
- **i18n** — All remaining hardcoded strings moved to the i18n system; all 5 new keys added to all 8 locale files

---

## [0.9.0] - 2026-02-14

### Added
- **Highlight navigation** — Previous/Next buttons in the popup to cycle through all highlights on the page. Shows current position and matched text (e.g., "3 / 42"). Page scrolls smoothly to off-screen highlights. Navigation wraps at both ends.
- **Active highlight style** — The currently selected highlight is shown with an orange background and blue underline for clear visibility
- **Stale range pruning** — Removes detached text nodes from the highlight cache, keeping counts accurate on dynamic pages

### Fixed
- Options page event listener leak on repeated renders
- Options page colour dropdown registering multiple document-level handlers
- Inconsistent highlight counts between popup and navigation (unified to single source of truth)
- Service worker async message handlers missing `.catch()` handlers
- Content script `STORAGE_CHANGED` handler not keeping the message channel open

---

## [0.8.0] - 2026-02-06

### Added
- **Regex matching** — New per-group Regex checkbox to use JavaScript regular expressions. Supports full regex syntax; invalid patterns are silently skipped; zero-length matches are safely handled.
- **Regex info link** — Info icon next to the Regex checkbox linking to [regexr.com](https://regexr.com/)

### Changed
- When Regex is enabled, Whole Word and Case Sensitive options are disabled (expressible within the regex itself)
- Match option label "Match whole words only" shortened to "Match whole word"

---

## [0.7.0] - 2026-02-01

### Added
- **Internationalization (i18n)** — Full translation support for 8 languages: English, Spanish, French, German, Portuguese (Brazil), Chinese (Simplified), Japanese, and Korean
- All user-facing text translated: labels, buttons, placeholders, notifications, confirmations, tooltips, and dynamic content

### Fixed
- Groups no longer collapse after adding words
- Selector error when auto-focusing the name input on new group creation

---

## [0.6.0] - 2026-01-29

### Changed
- **Options page** — Cleaner, modern layout with improved visual hierarchy
- **Popup terminology** — Updated to use "Groups" consistently throughout ("Manage Rules" → "Manage Groups")
- **Popup status section** — Simplified styling with cleaner divider-based layout

### Fixed
- "Groups Active" count now correctly shows group count instead of word count

---

## [0.5.0] - 2025-12-28

### Added
- **Whole word matching** — New per-group option to match complete words only (e.g., "error" won't match "errors")
- **Case sensitive matching** — New per-group option for exact case matching (e.g., "Error" won't match "error")

---

## [0.4.0] - 2025-12-28

### Added
- Horizontal padding and vertical spacing between groups for improved readability
- Clickable group headers with hover affordances

### Changed
- Expand/collapse chevron moved to the left side of the group header
- Replaced Lime with Teal and Purple with Indigo for better colour differentiation

### Fixed
- Rounded corners being clipped on group items
- Flexbox gap spacing override bug
- Groups no longer extend flush to container edges

---

## [0.3.0] - 2025-12-28

### Added
- **10 colour palette** — Expanded from 6 to 10 WCAG AA compliant colours (added Teal, Indigo, Blue, Peach)
- **Toast notifications** — User-friendly toasts replace console logging for all user actions, with auto-dismiss
- **Word limit feedback** — Input and button disable when a group reaches 20 words; red indicator and toast when words are skipped

### Changed
- Colour shades updated from Material Design 200 to 100 for better WCAG AA compliance
- Notification timeout centralized in `constants.js`

---

## [0.2.0] - 2025-12-27

### Added
- **Groups architecture** — Migrated from flat word lists to named groups containing multiple words
- **Same-origin iframe support** — Highlights text in iframes including those created with `document.write()`

### Changed
- All colour definitions consolidated to `PRESET_COLOURS` in `constants.js` (single source of truth)
- CSS for highlights now generated dynamically from constants (removed `content.css`)

### Fixed
- Toggle slider animation in the options page
- Iframe highlighting for dynamically created iframes

---

## [0.1.0] - 2025-12-24

### Initial Release

First public release. Highlights user-defined text on any webpage with configurable colours.

**Features:** Multiple highlight rules, 6 colours, drag-to-reorder, toggle rules on/off, works on all websites, all data stored locally.

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.11.0 | 2026-02-22 | Documentation site, uninstall feedback page |
| 0.10.0 | 2026-02-21 | Welcome page, accessibility & UX improvements |
| 0.9.0 | 2026-02-14 | Highlight navigation, stale range pruning |
| 0.8.0 | 2026-02-06 | Regex matching |
| 0.7.0 | 2026-02-01 | Internationalization (8 languages) |
| 0.6.0 | 2026-01-29 | Groups terminology, options page visual refresh |
| 0.5.0 | 2025-12-28 | Whole word and case sensitive matching |
| 0.4.0 | 2025-12-28 | UI/UX spacing and layout improvements |
| 0.3.0 | 2025-12-28 | 10 colours, toast notifications, word limit feedback |
| 0.2.0 | 2025-12-27 | Groups architecture, iframe support |
| 0.1.0 | 2025-12-24 | Initial release |
