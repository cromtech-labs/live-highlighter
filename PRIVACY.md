# Privacy Policy for Live Highlighter

**Last Updated**: 24 December 2025

## Overview

Live Highlighter is committed to protecting your privacy. This extension operates entirely on your local device and does not collect, transmit, or store any personal data on external servers.

## Data Collection

**Live Highlighter does NOT collect any data.**

Specifically, we do NOT:

- ❌ Track your browsing history
- ❌ Monitor which websites you visit
- ❌ Collect personal information
- ❌ Use analytics or telemetry
- ❌ Track usage statistics
- ❌ Share data with third parties
- ❌ Sell user data
- ❌ Use cookies for tracking

## Data Storage

### What is Stored Locally

The extension stores the following data **locally on your device only** using Chrome's `chrome.storage.local` API:

1. **Highlight Rules**
   - Text strings you want to highlight
   - Colour preferences for each rule
   - Enable/disable status for each rule
   - Rule priority order

2. **Extension Settings**
   - Global enable/disable state
   - Extension version number (for migration purposes)

### Where Data is Stored

**Free Version**
All data is stored using the Chrome storage API (`chrome.storage.local`), which means:

- Data stays on **your device only**
- Data is **never uploaded** to any external server
- Data is **never shared** with the extension developer
- Data is **not synced** to other devices

**Paid Version (Planned - Not Yet Available)**
A future paid version will offer optional sync functionality using Chrome's `chrome.storage.sync` API:

- Your highlight rules will be able to **sync across your devices** (e.g., work laptop, home computer)
- Syncing will be handled **entirely by Chrome/Google's infrastructure** - we never see your data
- Data will be **encrypted in transit** by Chrome's sync system
- Data will **never be sent to our servers** - only to Chrome's secure sync service
- You will remain signed into your **Google account** for sync to work
- Data will **never be shared** with the extension developer
- You will be able to **disable sync** at any time by switching back to local-only storage

### Data Retention

Your data remains on your device until you:

- Uninstall the extension, OR
- Manually delete your rules, OR
- Clear your browser's extension data

## Permissions Explanation

Live Highlighter requests the following permissions:

### `storage`

**Purpose**: Store your highlight rules and settings locally on your device.
**Privacy Impact**: None - data stays on your device.

### `activeTab`

**Purpose**: Access the current tab's content to apply highlights when you click the extension icon.
**Privacy Impact**: Limited - only accesses content of tabs you actively interact with.

### `scripting`

**Purpose**: Inject the highlighting code into web pages and count highlights across all frames.
**Privacy Impact**: Limited - only used to modify page appearance locally (highlighting). No data is sent anywhere.

## Third-Party Services

Live Highlighter does **NOT** use any third-party services, including:

- No analytics services (Google Analytics, etc.)
- No crash reporting services
- No advertising networks
- No external APIs
- No remote servers

## What Live Highlighter Can See

The extension can:

- ✅ See the text content of web pages you visit (to apply highlights)
- ✅ Modify the visual appearance of text (by adding highlight colors)

The extension does NOT:

- ❌ Send page content to any server
- ❌ Record which pages you visit
- ❌ Save page content
- ❌ Modify page functionality (only visual styling)

## Security

### Local-Only Processing

All highlighting happens **locally in your browser**. Text matching and highlighting are performed entirely on your device using JavaScript. No data leaves your computer.

### No Network Requests

The extension makes **zero network requests**. You can verify this by:

1. Opening Chrome DevTools (F12)
2. Go to Network tab
3. Use the extension
4. Observe: No requests from Live Highlighter

### Secure Storage

Your rules are stored using Chrome's secure storage API, which:

- Encrypts data at rest
- Isolates data from other extensions
- Provides secure access controls

## Children's Privacy

Live Highlighter does not knowingly collect any information from anyone, including children under 13. The extension is suitable for all ages as it collects no data.

## Changes to Privacy Policy

If we make changes to this privacy policy, we will:

1. Update the "Last Updated" date
2. Increment the version number
3. Notify users via extension update notes

Material changes will be clearly communicated in the Chrome Web Store listing.

## Open Source

Live Highlighter is open source. You can review the complete source code to verify our privacy claims:

- **Repository**: https://github.com/cromtech-labs/live-highlighter
- **License**: MIT

## Contact

If you have questions about this privacy policy or Live Highlighter's privacy practices:

- **GitHub Issues**: https://github.com/cromtech-labs/live-highlighter/issues
- **Email**: hello@cromtech.com.au

## Your Rights

You have the right to:

- ✅ View all data stored by the extension (via Chrome DevTools → Application → Storage)
- ✅ Delete all data (uninstall the extension or clear storage)
- ✅ Export your rules (manually copy from the options page)
- ✅ Use the extension without creating an account

## Compliance

Live Highlighter complies with:

- ✅ Chrome Web Store Developer Program Policies
- ✅ General Data Protection Regulation (GDPR) - by not collecting any personal data
- ✅ California Consumer Privacy Act (CCPA) - by not collecting or selling personal data
- ✅ Children's Online Privacy Protection Act (COPPA) - by not collecting any data from anyone

## Summary

**Live Highlighter is privacy-first by design:**

- 🔒 No data collection
- 🔒 No tracking
- 🔒 No external requests
- 🔒 All processing happens locally
- 🔒 Your data never leaves your device
- 🔒 No account required
- 🔒 Open source and transparent
- 🔒 We never see your data - even with sync enabled

---

**Questions?** We're committed to transparency. If you have any concerns about privacy, please reach out via GitHub Issues.

---

**Privacy Policy**: https://github.com/cromtech-labs/live-highlighter/blob/main/PRIVACY.md

Last updated: 24 December 2025
