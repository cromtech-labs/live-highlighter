// Live Highlighter - Welcome Page

document.addEventListener('DOMContentLoaded', () => {
  // Show extension version
  const manifest = chrome.runtime.getManifest();
  const versionEl = document.getElementById('version');
  if (versionEl) {
    versionEl.textContent = `v${manifest.version}`;
  }

  // Open options page when CTA is clicked
  document.getElementById('openOptionsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
