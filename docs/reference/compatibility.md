# Browser Compatibility

Live Highlighter is built using Manifest V3, the latest extension platform from Chromium.

## Supported Browsers

### Google Chrome

- **Minimum version:** 105+ (September 2022 or later)
- **Status:** Fully supported
- **Platform:** Windows, macOS, Linux, ChromeOS

### Microsoft Edge

- **Minimum version:** 105+ (September 2022 or later)
- **Status:** Fully supported
- **Platform:** Windows, macOS, Linux

## Why These Versions?

Live Highlighter requires Manifest V3 features that were stabilized in Chrome/Edge 105:

- Modern service workers for background processing
- Enhanced storage API
- Content script improvements
- Better security model

## Checking Your Browser Version

### Chrome

1. Open Chrome
2. Click the three dots menu (⋮) in the top-right
3. Go to **Help** → **About Google Chrome**
4. Your version is displayed at the top

### Edge

1. Open Edge
2. Click the three dots menu (⋮) in the top-right
3. Go to **Help and feedback** → **About Microsoft Edge**
4. Your version is displayed at the top

## Updating Your Browser

Both Chrome and Edge update automatically by default. If you're on an older version:

1. Check your version using the steps above
2. The browser will automatically download updates
3. Restart your browser to apply updates

## Feature Support

All features of Live Highlighter work consistently across supported browsers:

| Feature | Chrome 105+ | Edge 105+ |
|---------|-------------|-----------|
| Text highlighting | ✅ | ✅ |
| Multiple rules | ✅ | ✅ |
| Colour customization | ✅ | ✅ |
| Drag-to-reorder | ✅ | ✅ |
| Rule toggle | ✅ | ✅ |
| Local storage | ✅ | ✅ |
| All frames support | ✅ | ✅ |

## Operating System Compatibility

Live Highlighter works on all platforms supported by Chrome and Edge:

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Fedora, Debian, etc.)
- ✅ ChromeOS

## Future Browser Support

### Firefox

Firefox support is under consideration for future releases. Firefox uses a different extension API (WebExtensions) that would require additional development.

### Safari

Safari support is under consideration. Safari's extension model differs significantly from Chromium-based browsers.

## Known Limitations

### Browser-Specific Issues

None currently known. If you encounter a browser-specific issue, please report it on our [support page](../about/support.md).

### Platform-Specific Issues

None currently known.

## Testing

Live Highlighter is tested on:

- Chrome (latest stable and previous version)
- Edge (latest stable and previous version)
- Windows, macOS, and Linux platforms

## Questions?

If you're unsure whether Live Highlighter will work with your setup, check our [FAQ](faq.md) or visit the [support page](../about/support.md).
