// Background script for handling browser actions and context menus

// Show a toast notification on the active tab (much more reliable than system notifications)
async function showToast(tabId, message, type = 'success') {
  const color = type === 'success' ? '#4CAF50' : type === 'warning' ? '#f0ad4e' : '#667eea';
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ';
  
  await browser.tabs.executeScript(tabId, {
    code: `
      (function() {
        // Remove any existing toast
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
    `
  });
}

// Initialize extension
browser.runtime.onInstalled.addListener(async () => {
  console.log('Smart Bookmarks Manager installed!');
  
  // Initialize default data if not exists
  const result = await browser.storage.local.get(['categories', 'bookmarks']);
  
  if (!result.categories) {
    const defaultCategories = [
      { id: 'new', name: 'New', isDefault: true },
      { id: 'favorites', name: 'Favorites', isDefault: false }
    ];
    await browser.storage.local.set({ categories: defaultCategories });
  }
  
  if (!result.bookmarks) {
    await browser.storage.local.set({ bookmarks: [] });
  }
  
  // Create context menu for quick bookmarking
  browser.menus.create({
    id: 'quick-bookmark',
    title: 'Quick Bookmark This Page',
    contexts: ['page']
  });
});

// Handle context menu clicks
browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'quick-bookmark') {
    // Get current bookmarks
    const result = await browser.storage.local.get('bookmarks');
    const bookmarks = result.bookmarks || [];
    
    // Add bookmark to "New" category
    // Check if already bookmarked
    const existing = bookmarks.find(b => b.url === tab.url);
    if (existing) {
      browser.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Already Bookmarked',
        message: `"${tab.title}" is already in your bookmarks`
      });
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
    await browser.storage.local.set({ bookmarks });
    
    showToast(tab.id, 'Bookmark saved!', 'success');
  }
});

// Listen for keyboard shortcuts
browser.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-bookmark') {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    // Don't bookmark internal pages
    if (tab.url.startsWith('about:') || tab.url.startsWith('moz-extension:')) {
      return;
    }
    
    const result = await browser.storage.local.get('bookmarks');
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
    await browser.storage.local.set({ bookmarks });
    
    showToast(tab.id, 'Bookmark saved!', 'success');
  }
});
