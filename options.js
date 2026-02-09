// Options page script
const Storage = {
  async get(key) {
    const result = await browser.storage.local.get(key);
    return result[key];
  },
  async set(key, value) {
    await browser.storage.local.set({ [key]: value });
  }
};

let saveTimeout = null;

function showSaved() {
  const msg = document.getElementById('saved-message');
  msg.classList.add('visible');
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    msg.classList.remove('visible');
  }, 2000);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load current settings
  const darkMode = await Storage.get('darkMode') || false;
  const confirmDeleteBookmark = await Storage.get('confirmDeleteBookmark');
  const confirmDeleteCategory = await Storage.get('confirmDeleteCategory');

  // Default confirm delete to false (off)
  const confirmBm = confirmDeleteBookmark === undefined ? false : confirmDeleteBookmark;
  const confirmCat = confirmDeleteCategory === undefined ? true : confirmDeleteCategory;

  const openInNewTab = await Storage.get('openInNewTab');
  const openNew = openInNewTab === undefined ? true : openInNewTab;

  // Apply dark mode to options page itself
  if (darkMode) {
    document.body.classList.add('dark');
  }

  // Set toggles
  document.getElementById('dark-mode-toggle').checked = darkMode;
  document.getElementById('confirm-delete-bookmark-toggle').checked = confirmBm;
  document.getElementById('confirm-delete-category-toggle').checked = confirmCat;
  document.getElementById('open-new-tab-toggle').checked = openNew;

  // Dark mode toggle
  document.getElementById('dark-mode-toggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await Storage.set('darkMode', enabled);
    document.body.classList.toggle('dark', enabled);
    showSaved();
  });

  // Confirm delete bookmark toggle
  document.getElementById('confirm-delete-bookmark-toggle').addEventListener('change', async (e) => {
    await Storage.set('confirmDeleteBookmark', e.target.checked);
    showSaved();
  });

  // Confirm delete category toggle
  document.getElementById('confirm-delete-category-toggle').addEventListener('change', async (e) => {
    await Storage.set('confirmDeleteCategory', e.target.checked);
    showSaved();
  });

  // Open in new tab toggle
  document.getElementById('open-new-tab-toggle').addEventListener('change', async (e) => {
    await Storage.set('openInNewTab', e.target.checked);
    showSaved();
  });
});
