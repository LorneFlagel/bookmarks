// Background script for handling browser actions and context menus

// Cross-browser API wrapper — works natively in both Firefox and Chrome MV3
// No polyfill needed in the background/service worker
const api = (typeof browser !== 'undefined') ? browser : chrome;
const menusAPI = (typeof browser !== 'undefined' && browser.menus) ? browser.menus : (api.contextMenus || chrome.contextMenus);
const isChromium = typeof browser === 'undefined';

// Wrap Chrome callback APIs into promises when needed
function storageGet(keys) {
  return new Promise((resolve) => {
    api.storage.local.get(keys, resolve);
  });
}

function storageSet(data) {
  return new Promise((resolve) => {
    api.storage.local.set(data, resolve);
  });
}

function queryTabs(opts) {
  return new Promise((resolve) => {
    api.tabs.query(opts, resolve);
  });
}

// Show a toast notification on the active tab
async function showToast(tabId, message, type = 'success') {
  const color = type === 'success' ? '#4CAF50' : type === 'warning' ? '#f0ad4e' : '#667eea';
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ';

  const toastCode = `
    (function() {
      const old = document.getElementById('sbm-toast');
      if (old) old.remove();
      const toast = document.createElement('div');
      toast.id = 'sbm-toast';
      toast.textContent = '${icon} ${message.replace(/'/g, "\\'")}';
      toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:2147483647;' +
        'padding:12px 20px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
        'font-size:14px;font-weight:500;color:white;background:${color};' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.3s ease;' +
        'pointer-events:none;max-width:400px;';
      document.body.appendChild(toast);
      requestAnimationFrame(() => { toast.style.opacity = '1'; });
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    })();
  `;

  try {
    if (isChromium && chrome.scripting) {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (code) => { eval(code); },
        args: [toastCode]
      });
    } else {
      await browser.tabs.executeScript(tabId, { code: toastCode });
    }
  } catch (e) {
    // Fallback to notification if injection fails (restricted pages)
    api.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: type === 'warning' ? 'Already Bookmarked' : 'Bookmark Saved',
      message: message
    });
  }
}

// Shared bookmark logic
async function quickBookmark(tab) {
  if (!tab || !tab.url) return;

  // Don't bookmark internal pages
  if (tab.url.startsWith('about:') || tab.url.startsWith('moz-extension:') ||
      tab.url.startsWith('chrome:') || tab.url.startsWith('chrome-extension:') ||
      tab.url.startsWith('edge:')) {
    return;
  }

  const result = await storageGet('bookmarks');
  const bookmarks = result.bookmarks || [];

  // Check if already bookmarked
  const existing = bookmarks.find(b => b.url === tab.url);
  if (existing) {
    showToast(tab.id, 'Already bookmarked!', 'warning');
    return;
  }

  const newBookmark = {
    id: 'bm_' + Date.now(),
    title: tab.title,
    url: tab.url,
    categoryId: 'new',
    createdAt: Date.now()
  };

  bookmarks.push(newBookmark);
  await storageSet({ bookmarks });
  showToast(tab.id, 'Bookmark saved!', 'success');
}

// Initialize extension
api.runtime.onInstalled.addListener(async () => {
  console.log('Smart Bookmarks Manager installed!');

  const result = await storageGet(['categories', 'bookmarks']);

  if (!result.categories) {
    const defaultCategories = [
      { id: 'new', name: 'New', isDefault: true },
      { id: 'favorites', name: 'Favorites', isDefault: false }
    ];
    await storageSet({ categories: defaultCategories });
  }

  if (!result.bookmarks) {
    await storageSet({ bookmarks: [] });
  }

  // Create context menu
  menusAPI.create({
    id: 'quick-bookmark',
    title: 'Quick Bookmark This Page',
    contexts: ['page']
  });
});

// Handle context menu clicks
menusAPI.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'quick-bookmark') {
    await quickBookmark(tab);
  }
});

// Listen for keyboard shortcuts
api.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-bookmark') {
    const tabs = await queryTabs({ active: true, currentWindow: true });
    await quickBookmark(tabs[0]);
  }
});
