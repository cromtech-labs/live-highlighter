# Live Highlighter Test Suite

This directory contains test files to validate Live Highlighter's highlighting capabilities across different scenarios.

## Test Files

### 1. `10000-words.html` - Performance Test
**Purpose:** Test highlighting performance on large documents

**Features:**
- ~10,000 words of realistic content
- Multiple keyword occurrences throughout
- Tests CSS Highlight API performance with large text volumes
- Keywords: error, success, resource, data, tags, kv-, api, service, request, response

**What to test:**
- Page load time and responsiveness
- Scrolling performance while highlighting is active
- Memory usage with many highlights
- Toggle on/off performance

---

### 2. `shadow-dom.html` - Shadow DOM Test
**Purpose:** Validate highlighting works inside Shadow DOM components

**Features:**
- Multiple shadow DOM components
- Nested shadow roots (shadow DOM inside shadow DOM)
- Dynamically created shadow components
- Styled shadow components

**What to test:**
- Highlights appear in shadow DOM content
- Highlights appear in nested shadow roots
- Dynamically added shadow components get highlighted
- Shadow DOM styles don't interfere with highlights

---

### 3. `virtual-scroll.html` - Virtual Scrolling Test
**Purpose:** Test highlighting with virtual scrolling where DOM nodes are recycled

**Features:**
- 10,000 virtual list items
- DOM recycling on scroll
- Realistic implementation of virtual scrolling
- Scroll event debouncing

**What to test:**
- Highlights appear as you scroll to new items
- No flickering or highlight loss during scrolling
- Performance remains good while scrolling
- Scroll handler debounce (300ms) works correctly

---

### 4. `dynamic-content.html` - Dynamic Content Test
**Purpose:** Validate highlighting updates as content changes

**Features:**
- Add new content dynamically
- Modify existing content
- Remove content
- Continuous live updates

**What to test:**
- New content gets highlighted immediately
- Modified content updates highlights correctly
- Removed content doesn't cause errors
- Live updates maintain highlights
- MutationObserver handles all changes

---

### 5. `overlapping-text.html` - Priority and Edge Cases
**Purpose:** Test group priority and edge cases for text matching

**Features:**
- Multiple groups matching same text
- Case insensitivity testing
- Punctuation boundaries
- Prefix patterns (kv-)
- Adjacent keywords
- High-density keyword concentration

**What to test:**
- First matching group wins (priority)
- Case insensitive matching works
- Punctuation doesn't interfere
- Prefix patterns match correctly
- No incorrect overlapping highlights
- Performance with many nearby matches

---

## How to Use These Tests

1. **Load the extension:**
   - Go to `chrome://extensions`
   - Enable Developer Mode
   - Load unpacked extension from project root

2. **Configure test groups:**
   Create these groups in the extension options:
   - Group 1 (Yellow): Add word `error`
   - Group 2 (Green): Add word `success` and `error`
   - Group 3 (Cyan): Add word `resource`
   - Group 4 (Pink): Add word `data`
   - Group 5 (Orange): Add word `tags`
   - Group 6 (Lavender): Add word `kv-`

3. **Open test files:**
   - Navigate to `file:///D:/live-highlighter/tests/[testfile].html`
   - Or use a local server: `python -m http.server 8000`

4. **Verify highlighting:**
   - Check that keywords are highlighted with correct colors
   - Test enabling/disabling highlighting
   - Test adding/removing/reordering groups
   - Monitor browser performance and console for errors

---

## Expected Behavior

### ✅ Success Criteria
- All keywords highlighted with correct colors
- No performance degradation on large pages
- Highlights update within 300ms of content changes
- No console errors or warnings
- Smooth scrolling performance
- Shadow DOM content highlighted correctly
- Virtual scrolling maintains highlights

### ❌ Failure Indicators
- Missing highlights on visible content
- Console errors in content script
- Page lag or freezing
- Memory leaks (check DevTools Performance)
- Highlights don't update when content changes
- Shadow DOM content not highlighted
- Incorrect color applied (wrong group priority)

---

## Performance Benchmarks

### Target Metrics (10000-words.html)
- Initial highlight time: < 500ms
- Scroll performance: 60 FPS
- Memory usage: < 50MB additional
- Toggle on/off: < 200ms

### Target Metrics (virtual-scroll.html)
- Scroll smoothness: No stuttering
- Re-highlight after scroll: < 300ms
- Consistent performance across full list

---

## Debugging Tips

1. **Open DevTools Console** to see Live Highlighter logs:
   ```
   Live Highlighter: Content script initializing
   Live Highlighter: Loaded X groups, enabled: true
   Live Highlighter: MutationObserver started
   ```

2. **Check CSS.highlights** in console:
   ```javascript
   // View all highlights
   for (let [name, highlight] of CSS.highlights) {
     console.log(name, highlight.size);
   }
   ```

3. **Monitor Performance** (DevTools → Performance):
   - Record while scrolling
   - Look for long tasks (> 50ms)
   - Check JavaScript heap size

4. **Test in Different Modes:**
   - Light mode and dark mode
   - With DevTools open/closed
   - With extension enabled/disabled
   - With different group counts (1, 5, 10 groups)

---

### 6. `iframes.html` - iFrame Test
**Purpose:** Validate highlighting works inside same-origin iframes

**Features:**
- Multiple same-origin iframes
- Nested content within iframes
- Scrollable iframe content (Azure Portal-like)
- Dynamically created iframes
- Parent and iframe content interaction

**What to test:**
- Highlights appear in all iframe content
- Scrollable iframe panels work correctly
- Dynamically added iframes get highlighted
- No cross-origin security errors
- Performance with multiple iframes

---

### 7. `complex-scrolling.html` - Azure DevOps-like Layout
**Purpose:** Test highlighting in complex multi-pane scrolling layouts

**Features:**
- Split pane layout (list + details)
- Multiple independent scroll containers
- Fixed headers with sticky positioning
- Nested scrollable areas
- Large data table (100+ rows)
- Side panel with multiple sections

**What to test:**
- Highlights work in all scroll containers
- Sticky table headers don't interfere
- Nested scroll areas highlight correctly
- Performance with multiple scroll containers
- Real-world Azure DevOps-like complexity

---

### 8. `max-capacity.html` - Maximum Capacity Test (200 Words)
**Purpose:** Test extension at maximum capacity with 200 total words across all groups

**Features:**
- All 200 words displayed in grid (10 groups × 20 words each)
- Large document performance test (~5,000 words)
- Priority and overlap testing with 200-word configuration
- Dynamic content with full word set
- Boundary testing (199, 200, 201 words)
- Multi-document iframe testing
- Toggle performance measurement
- High-density stress test (80%+ target words)

**What to test:**
- All 200 words highlight correctly
- Performance remains acceptable with maximum words
- Priority system works with 10 groups
- Dynamic content updates handle 200 words
- Iframes work with full word set
- Toggle operations complete quickly
- No memory leaks at capacity
- High density content renders correctly

**Setup Required:**
Create 10 groups with 20 words each following the setup instructions in the test file. This requires configuring the maximum allowed groups and words.

---

## Adding New Tests

When adding new test files:
1. Follow the existing HTML structure
2. Include header with test description
3. Document expected behavior
4. Add entry to this README
5. Use consistent styling (Chrome-inspired)
6. Include both positive and edge cases
