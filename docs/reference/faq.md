# Frequently Asked Questions

## General

### What is Live Highlighter?

Live Highlighter is a browser extension that highlights user-defined text on web pages with customizable colours. It helps you quickly spot important information like environment names, status messages, or specific keywords.

### Is Live Highlighter free?

Yes, Live Highlighter is completely free and open source.

### Which browsers are supported?

Chrome 105+ and Edge 105+ are currently supported. See the [compatibility page](compatibility.md) for details.

## Privacy & Security

### Does Live Highlighter collect my data?

No. Live Highlighter collects zero data. Everything happens locally on your device. See our [privacy policy](privacy.md) for details.

### Can Live Highlighter see my passwords or sensitive information?

Live Highlighter only reads text content to find matches for your highlight rules. It doesn't collect, store, or transmit any data, including passwords or sensitive information.

### Is my data synced across devices?

No, currently all highlight rules are stored locally on each device. Cross-device sync is a potential future feature.

## Features & Usage

### How many highlight rules can I create?

There's no hard limit. The extension performs well even with many rules, but for practical purposes, 10-20 rules is usually sufficient.

### Can I highlight the same text in different colours on different websites?

Currently, no. A rule applies globally to all websites. Website-specific rules are a potential future feature.

### Why isn't my rule working?

Common reasons:

1. The rule might be disabled (check the toggle)
2. Text matching is case-sensitive - "Error" won't match "error"
3. A higher-priority rule might be matching first
4. The text might not exist on the page exactly as you entered it

### Can I use regular expressions in rules?

Not currently. Rules use exact text matching. Regular expression support is a potential future feature.

### Do highlights work in iframes?

Yes, Live Highlighter works in all frames within a page (`all_frames: true` in the manifest).

### Can I export my rules to share with my team?

Not currently, but export/import functionality is planned for a future release.

## Performance

### Will Live Highlighter slow down my browser?

No. Live Highlighter is optimized for performance and has negligible impact on browser speed or page load times.

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
2. Check if the text actually exists on the page
3. Verify your rule is enabled and matches the text exactly
4. Try disabling other extensions that might interfere

### I accidentally deleted a rule, can I recover it?

Unfortunately, no. Deleted rules cannot be recovered. This is why export/import functionality is planned for a future release.

### The extension stopped working after a browser update

1. Check if you're on a supported browser version (Chrome/Edge 105+)
2. Try disabling and re-enabling the extension
3. Try uninstalling and reinstalling the extension
4. Report the issue on our [support page](../about/support.md)

## Customization

### Can I change the highlight colour intensity?

Not currently. The 6 available colours are pre-selected for good readability and accessibility.

### Can I highlight with bold or underline instead of background colour?

Not currently, but alternative highlight styles are under consideration for future releases.

### Can I add my own custom colours?

Not currently. The 6 available colours are designed to work well together and be accessible.

## Development & Contributing

### Is Live Highlighter open source?

Yes! The source code is available on [GitHub](https://github.com/cromtech-labs/browser-highlighter).

### Can I contribute to Live Highlighter?

Yes! Contributions are welcome. Visit the GitHub repository for contribution guidelines.

### How do I report a bug?

Please report bugs on our [GitHub Issues page](https://github.com/cromtech-labs/browser-highlighter/issues).

### How do I request a feature?

Feature requests are welcome on [GitHub Issues](https://github.com/cromtech-labs/browser-highlighter/issues). Please check if someone has already requested the same feature.

## Installation & Updates

### How do I install Live Highlighter?

See the [installation guide](../getting-started/installation.md) for step-by-step instructions.

### How do I update to the latest version?

Browser extensions update automatically. You can also manually update:

1. Go to `chrome://extensions` or `edge://extensions`
2. Enable "Developer mode"
3. Click "Update" at the top

### Will my rules be preserved when updating?

Yes, all your rules are stored in local storage and will persist across updates.

## Advanced

### What permissions does Live Highlighter need?

Live Highlighter requires:

- **Storage:** To save your highlight rules
- **Active Tab:** To access page content for highlighting
- **Scripting:** To inject highlighting code into pages

See the [privacy policy](privacy.md) for details on how these permissions are used.

### Can I use Live Highlighter in incognito mode?

Yes, but you need to enable it:

1. Go to `chrome://extensions` or `edge://extensions`
2. Find Live Highlighter
3. Click "Details"
4. Enable "Allow in incognito"

Note: Rules created in normal mode will also apply in incognito mode.

## Still Have Questions?

If your question isn't answered here, visit our [support page](../about/support.md) to learn how to get help.
