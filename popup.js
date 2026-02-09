// Quick bookmark from popup
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab info
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  // Load categories
  const result = await browser.storage.local.get('categories');
  const categories = result.categories || [{ id: 'new', name: 'New', isDefault: true }];
  
  // Populate form with current tab info
  document.getElementById('bookmark-title').value = currentTab.title;
  document.getElementById('bookmark-url').value = currentTab.url;
  
  // Populate category select
  const select = document.getElementById('category-select');
  select.innerHTML = '';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    if (category.isDefault) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  
  // Save bookmark
  document.getElementById('save-btn').addEventListener('click', async () => {
    const title = document.getElementById('bookmark-title').value.trim();
    const url = document.getElementById('bookmark-url').value.trim();
    const categoryId = document.getElementById('category-select').value;
    
    if (!title || !url) {
      alert('Please enter both title and URL');
      return;
    }
    
    // Get existing bookmarks
    const bookmarksResult = await browser.storage.local.get('bookmarks');
    const bookmarks = bookmarksResult.bookmarks || [];
    
    // Check if already bookmarked
    const existing = bookmarks.find(b => b.url === url);
    if (existing) {
      const message = document.getElementById('message');
      message.textContent = '⚠ Already bookmarked!';
      message.style.display = 'block';
      message.style.color = '#f0ad4e';
      return;
    }
    
    // Add new bookmark
    const newBookmark = {
      id: 'bm_' + Date.now(),
      title,
      url,
      categoryId,
      createdAt: Date.now()
    };
    
    bookmarks.push(newBookmark);
    await browser.storage.local.set({ bookmarks });
    
    // Show success message
    const message = document.getElementById('message');
    message.textContent = '✓ Bookmark saved!';
    message.style.display = 'block';
    
    setTimeout(() => {
      window.close();
    }, 1000);
  });
});
