# Frequently Asked Questions

## General

### What is Live Highlighter?

Live Highlighter is a browser extension that highlights user-defined words and phrases on web pages with customizable colours. Organise your highlights into groups, each with its own colour and matching options, to quickly spot important information like environment names, status messages, or specific keywords.

### Is Live Highlighter free?

Yes, Live Highlighter is completely free and open source.

### Which browsers are supported?

Chrome 105+ and Edge 105+ are currently supported. See the [compatibility page](compatibility.md) for details.

## Privacy & Security

### Does Live Highlighter collect my data?

No. Live Highlighter collects zero data. Everything happens locally on your device. See our [privacy policy](privacy.md) for details.

### Can Live Highlighter see my passwords or sensitive information?

Live Highlighter only reads text content to find matches for your highlight groups. It doesn't collect, store, or transmit any data, including passwords or sensitive information.

### Is my data synced across devices?

No, all groups and words are stored locally on each device. Cross-device sync is a potential future feature.

## Features & Usage

### How many groups and words can I create?

- Up to **10 groups**
- Up to **20 words per group**
- Up to **200 words total** across all groups

### Can I highlight the same text in different colours on different websites?

Currently, no. Groups apply globally to all websites. Website-specific groups are a potential future feature.

### Why isn't my group highlighting text?

Common reasons:

1. The group or global highlighting might be disabled — check both toggles
2. Case sensitive matching is enabled — "Error" won't match "error"
3. Whole word matching is enabled — "prod" won't match "production"
4. A higher-priority group is matching the same text first
5. The text might not exist on the page exactly as you entered it

### Can I use regular expressions?

Yes. Enable the **Regex** option on a group to use JavaScript regular expressions for matching. This supports alternation (`error|warn`), character classes, quantifiers, and more. Invalid patterns are silently skipped.

### Can I match case-sensitively?

Yes. Enable the **Case sensitive** option on a group. By default, matching is case-insensitive.

### Can I match whole words only?

Yes. Enable the **Match whole word** option on a group to avoid partial matches. For example, "error" will match "There was an error" but not "errors" or "proofreader".

### Do highlights work in iframes?

Yes, Live Highlighter works in all same-origin frames within a page. Cross-origin iframes cannot be accessed due to browser security restrictions.

### Can I export my groups to share with my team?

Not currently, but export/import functionality is planned for a future release.

### Does it work on dynamically loaded content?

Yes. Live Highlighter uses a mutation observer to detect new content added to the page (e.g., lazy-loaded sections, infinite scroll) and highlights it automatically.

## Performance

### Will Live Highlighter slow down my browser?

No. Live Highlighter uses the CSS Custom Highlight API, which highlights text without modifying the DOM. It has negligible impact on browser speed or page load times.

### Does it work on large pages?

Yes, highlighting is efficient even on pages with lots of text.

### Will it use a lot of memory?

No, Live Highlighter has minimal memory footprint.

## Troubleshooting

### The extension icon isn't showing up

1. Check if the extension is installed (go to `chrome://extensions` or `edge://extensions`)
2. Make sure the extension is enabled
3. Try restarting your browser

### Highlights aren't appearing on a specific website

1. Refresh the page
2. Check that the text actually exists on the page
3. Verify global highlighting is enabled (popup toggle)
4. Verify your group is enabled and the word matches the text
5. Try disabling other extensions that might interfere

### I accidentally deleted a group — can I recover it?

Unfortunately, no. Deleted groups cannot be recovered. This is why export/import functionality is planned for a future release.

### The extension stopped working after a browser update

1. Check if you're on a supported browser version (Chrome/Edge 105+)
2. Try disabling and re-enabling the extension
3. Try uninstalling and reinstalling the extension
4. Report the issue on our [support page](../about/support.md)

## Customization

### Can I change the highlight colour intensity?

Not currently. The 10 available colours are pre-selected for good readability and WCAG AA accessibility compliance.

### Can I highlight with bold or underline instead of background colour?

Not currently, but alternative highlight styles are under consideration for future releases.

### Can I add my own custom colours?

Not currently. The 10 available colours are designed to work well together and be accessible.

## Development & Contributing

### Is Live Highlighter open source?

Yes! The source code is available on [GitHub](https://github.com/cromtech-labs/live-highlighter).

### Can I contribute to Live Highlighter?

Yes! Contributions are welcome. Visit the GitHub repository for contribution guidelines.

### How do I report a bug?

Please report bugs on our [GitHub Issues page](https://github.com/cromtech-labs/live-highlighter/issues).

### How do I request a feature?

Feature requests are welcome on [GitHub Issues](https://github.com/cromtech-labs/live-highlighter/issues). Please check if someone has already requested the same feature.

## Installation & Updates

### How do I install Live Highlighter?

See the [installation guide](../getting-started/installation.md) for step-by-step instructions.

### How do I update to the latest version?

Browser extensions update automatically. You can also manually update:

1. Go to `chrome://extensions` or `edge://extensions`
2. Enable "Developer mode"
3. Click "Update" at the top

### Will my groups be preserved when updating?

Yes, all your groups and words are stored in local storage and will persist across updates.

## Advanced

### What permissions does Live Highlighter need?

Live Highlighter requires:

- **Storage:** To save your highlight groups and settings
- **Active Tab:** To access page content for highlighting
- **Scripting:** To inject highlighting code into pages
- **Tabs:** To open the welcome page on first install

See the [privacy policy](privacy.md) for details on how these permissions are used.

### Can I use Live Highlighter in incognito mode?

Yes, but you need to enable it:

1. Go to `chrome://extensions` or `edge://extensions`
2. Find Live Highlighter
3. Click "Details"
4. Enable "Allow in incognito"

Your groups will apply in incognito mode once enabled.

### Is Live Highlighter available in other languages?

Yes. The UI is available in 8 languages: English, Spanish, French, German, Portuguese (Brazil), Chinese (Simplified), Japanese, and Korean. The extension uses your browser's language setting automatically.

## Still Have Questions?

If your question isn't answered here, visit our [support page](../about/support.md) to learn how to get help.
