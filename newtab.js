// Storage helper functions
const Storage = {
  async get(key) {
    const result = await browser.storage.local.get(key);
    return result[key];
  },
  
  async set(key, value) {
    await browser.storage.local.set({ [key]: value });
  },
  
  async getAll() {
    return await browser.storage.local.get(null);
  }
};

// Initialize default data structure
async function initializeData() {
  let categories = await Storage.get('categories');
  let bookmarks = await Storage.get('bookmarks');
  
  if (!categories) {
    categories = [
      { id: 'new', name: 'New', isDefault: true },
      { id: 'favorites', name: 'Favorites', isDefault: false }
    ];
    await Storage.set('categories', categories);
  }
  
  if (!bookmarks) {
    bookmarks = [];
    await Storage.set('bookmarks', bookmarks);
  }
  
  return { categories, bookmarks };
}

// State
let currentEditingCategory = null;
let currentEditingBookmark = null;
let categories = [];
let bookmarks = [];
let viewMode = 'list'; // 'list' or 'grid'
let darkMode = false;
let collapsedCategories = {}; // { categoryId: true/false }

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  const data = await initializeData();
  categories = data.categories;
  bookmarks = data.bookmarks;
  
  // Load preferences
  viewMode = await Storage.get('viewMode') || 'list';
  collapsedCategories = await Storage.get('collapsedCategories') || {};
  
  // Auto-detect dark mode on first use, otherwise load saved preference
  const savedDarkMode = await Storage.get('darkMode');
  if (savedDarkMode === undefined || savedDarkMode === null) {
    darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    await Storage.set('darkMode', darkMode);
  } else {
    darkMode = savedDarkMode;
  }
  
  // Apply dark mode
  if (darkMode) {
    document.body.classList.add('dark');
  }
  
  renderCategories();
  setupEventListeners();
  setupSearch();
  updateViewButton();
  updateDarkModeButton();

  // Listen for storage changes from other tabs, popup, or background script
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.darkMode) {
      darkMode = changes.darkMode.newValue;
      document.body.classList.toggle('dark', darkMode);
      updateDarkModeButton();
    }

    if (changes.bookmarks) {
      bookmarks = changes.bookmarks.newValue || [];
      renderCategories();
    }

    if (changes.categories) {
      categories = changes.categories.newValue || [];
      renderCategories();
    }

    if (changes.viewMode) {
      viewMode = changes.viewMode.newValue || 'list';
      updateViewButton();
      renderCategories();
    }

    if (changes.collapsedCategories) {
      collapsedCategories = changes.collapsedCategories.newValue || {};
      renderCategories();
    }
  });
});

// Render all categories and bookmarks
function renderCategories() {
  const container = document.getElementById('categories-container');
  container.innerHTML = '';
  
  categories.forEach(category => {
    let categoryBookmarks = bookmarks
      .filter(b => b.categoryId === category.id)
      .sort((a, b) => a.title.localeCompare(b.title));
    
    // If in grid view, reorganize bookmarks to sort within columns
    if (viewMode === 'grid' && categoryBookmarks.length > 0) {
      const columns = 2;
      const itemsPerColumn = Math.ceil(categoryBookmarks.length / columns);
      const reordered = [];
      
      // Interleave items: col1[0], col2[0], col1[1], col2[1], etc.
      for (let i = 0; i < itemsPerColumn; i++) {
        for (let col = 0; col < columns; col++) {
          const index = col * itemsPerColumn + i;
          if (index < categoryBookmarks.length) {
            reordered.push(categoryBookmarks[index]);
          }
        }
      }
      categoryBookmarks = reordered;
    }
    
    const categoryEl = createCategoryElement(category, categoryBookmarks);
    container.appendChild(categoryEl);
  });
}

// Create category element
function createCategoryElement(category, categoryBookmarks) {
  const div = document.createElement('div');
  div.className = 'category';
  div.dataset.categoryId = category.id;
  div.draggable = true;
  
  // Category drag events
  div.addEventListener('dragstart', handleCategoryDragStart);
  div.addEventListener('dragend', handleCategoryDragEnd);
  div.addEventListener('dragover', handleCategoryDragOver);
  div.addEventListener('drop', handleCategoryDrop);
  div.addEventListener('dragleave', handleDragLeave);
  
  const header = document.createElement('div');
  header.className = 'category-header';
  
  // Prevent dragging when clicking on header elements
  header.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      div.draggable = false;
    } else {
      div.draggable = true;
    }
  });
  
  const title = document.createElement('div');
  title.className = 'category-title';
  
  const dragHandle = document.createElement('span');
  dragHandle.className = 'category-drag-handle';
  dragHandle.innerHTML = '⋮⋮';
  dragHandle.title = 'Drag to reorder';
  
  const collapseToggle = document.createElement('span');
  collapseToggle.className = 'collapse-toggle';
  collapseToggle.textContent = '▼';
  collapseToggle.title = 'Collapse/Expand';
  if (collapsedCategories[category.id]) {
    collapseToggle.classList.add('collapsed');
  }
  collapseToggle.onclick = (e) => {
    e.stopPropagation();
    toggleCollapse(category.id);
  };
  
  const titleText = document.createElement('span');
  titleText.textContent = category.name;
  
  title.appendChild(dragHandle);
  title.appendChild(collapseToggle);
  title.appendChild(titleText);
  
  if (category.isDefault) {
    const badge = document.createElement('span');
    badge.className = 'badge-new';
    badge.textContent = 'DEFAULT';
    title.appendChild(badge);
  }
  
  const actions = document.createElement('div');
  actions.className = 'category-actions';
  
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary btn-small';
  addBtn.textContent = '+ Add Bookmark';
  addBtn.onclick = () => openBookmarkModal(null, category.id);
  
  actions.appendChild(addBtn);
  
  if (!category.isDefault) {
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-small';
    editBtn.textContent = '✏️ Edit';
    editBtn.onclick = () => openCategoryModal(category);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-small';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.onclick = () => deleteCategory(category.id);
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  }
  
  header.appendChild(title);
  header.appendChild(actions);
  
  const isCollapsed = collapsedCategories[category.id];
  
  if (isCollapsed) {
    header.classList.add('collapsed');
  }
  
  const bookmarksList = document.createElement('div');
  bookmarksList.className = viewMode === 'grid' ? 'bookmarks-list grid-view' : 'bookmarks-list';
  if (isCollapsed) {
    bookmarksList.classList.add('collapsed');
  }
  
  if (categoryBookmarks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-category';
    empty.textContent = 'No bookmarks yet. Add one to get started!';
    bookmarksList.appendChild(empty);
  } else {
    categoryBookmarks.forEach(bookmark => {
      const bookmarkCard = createBookmarkCard(bookmark);
      bookmarksList.appendChild(bookmarkCard);
    });
  }
  
  div.appendChild(header);
  div.appendChild(bookmarksList);
  
  return div;
}

// Create bookmark card
function createBookmarkCard(bookmark) {
  const card = document.createElement('div');
  card.className = 'bookmark-card';
  card.draggable = true;
  card.dataset.bookmarkId = bookmark.id;
  
  // Drag events
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);
  
  // Click to open bookmark
  card.onclick = async (e) => {
    if (!e.target.classList.contains('btn') && !e.target.classList.contains('drag-handle')) {
      const openInNewTab = await Storage.get('openInNewTab');
      const newTab = openInNewTab === undefined ? true : openInNewTab;
      if (newTab) {
        window.open(bookmark.url, '_blank');
      } else {
        window.location.href = bookmark.url;
      }
    }
  };
  
  // Drag handle
  const dragHandle = document.createElement('div');
  dragHandle.className = 'drag-handle';
  dragHandle.innerHTML = '⋮⋮';
  dragHandle.title = 'Drag to move';
  
  // Bookmark content container
  const content = document.createElement('div');
  content.className = 'bookmark-content';
  
  const icon = document.createElement('div');
  icon.className = 'bookmark-icon';
  icon.textContent = getFavicon(bookmark.url);
  
  const info = document.createElement('div');
  info.className = 'bookmark-info';
  
  const title = document.createElement('div');
  title.className = 'bookmark-title';
  title.textContent = bookmark.title;
  
  const url = document.createElement('div');
  url.className = 'bookmark-url';
  url.textContent = bookmark.url;
  
  const actions = document.createElement('div');
  actions.className = 'bookmark-actions';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-secondary btn-small';
  editBtn.textContent = '✏️';
  editBtn.onclick = (e) => {
    e.stopPropagation();
    openBookmarkModal(bookmark);
  };
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger btn-small';
  deleteBtn.textContent = '🗑️';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteBookmark(bookmark.id);
  };
  
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  
  // Assemble the card
  info.appendChild(title);
  info.appendChild(url);
  
  content.appendChild(icon);
  content.appendChild(info);
  
  card.appendChild(dragHandle);
  card.appendChild(content);
  card.appendChild(actions);
  
  return card;
}

// Get favicon emoji based on URL
function getFavicon(url) {
  const emojis = {
    'github': '🐙',
    'google': '🔍',
    'youtube': '📺',
    'twitter': '🐦',
    'facebook': '📘',
    'reddit': '🤖',
    'stackoverflow': '📚',
    'wikipedia': '📖',
    'amazon': '🛒',
    'netflix': '🎬'
  };
  
  const domain = new URL(url).hostname.toLowerCase();
  for (const [key, emoji] of Object.entries(emojis)) {
    if (domain.includes(key)) return emoji;
  }
  
  return '🔖';
}

// Category Modal
function openCategoryModal(category = null) {
  currentEditingCategory = category;
  const modal = document.getElementById('category-modal');
  const title = document.getElementById('modal-title');
  const input = document.getElementById('category-name-input');
  
  if (category) {
    title.textContent = 'Edit Category';
    input.value = category.name;
  } else {
    title.textContent = 'Add Category';
    input.value = '';
  }
  
  modal.classList.remove('hidden');
  input.focus();
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.add('hidden');
  currentEditingCategory = null;
}

async function saveCategory() {
  const input = document.getElementById('category-name-input');
  const name = input.value.trim();
  
  if (!name) {
    alert('Please enter a category name');
    return;
  }
  
  if (currentEditingCategory) {
    // Edit existing category
    const index = categories.findIndex(c => c.id === currentEditingCategory.id);
    categories[index].name = name;
  } else {
    // Add new category
    const newCategory = {
      id: 'cat_' + Date.now(),
      name: name,
      isDefault: false
    };
    categories.push(newCategory);
  }
  
  await Storage.set('categories', categories);
  renderCategories();
  closeCategoryModal();
}

async function deleteCategory(categoryId) {
  const confirmDeleteCategory = await Storage.get('confirmDeleteCategory');
  const shouldConfirm = confirmDeleteCategory === undefined ? true : confirmDeleteCategory;
  if (shouldConfirm && !confirm('Are you sure you want to delete this category? All bookmarks will be moved to "New".')) {
    return;
  }
  
  // Move bookmarks to "New" category
  bookmarks = bookmarks.map(b => {
    if (b.categoryId === categoryId) {
      b.categoryId = 'new';
    }
    return b;
  });
  
  categories = categories.filter(c => c.id !== categoryId);
  
  await Storage.set('categories', categories);
  await Storage.set('bookmarks', bookmarks);
  
  renderCategories();
}

// Bookmark Modal
function openBookmarkModal(bookmark = null, categoryId = null) {
  currentEditingBookmark = bookmark;
  const modal = document.getElementById('bookmark-modal');
  const title = document.getElementById('bookmark-modal-title');
  const titleInput = document.getElementById('bookmark-title-input');
  const urlInput = document.getElementById('bookmark-url-input');
  const categorySelect = document.getElementById('bookmark-category-select');
  
  // Populate category select
  categorySelect.innerHTML = '<option value="">Select category...</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
  
  if (bookmark) {
    title.textContent = 'Edit Bookmark';
    titleInput.value = bookmark.title;
    urlInput.value = bookmark.url;
    categorySelect.value = bookmark.categoryId;
  } else {
    title.textContent = 'Add Bookmark';
    titleInput.value = '';
    urlInput.value = '';
    categorySelect.value = categoryId || 'new';
  }
  
  modal.classList.remove('hidden');
  titleInput.focus();
}

function closeBookmarkModal() {
  document.getElementById('bookmark-modal').classList.add('hidden');
  currentEditingBookmark = null;
}

async function saveBookmark() {
  const titleInput = document.getElementById('bookmark-title-input');
  const urlInput = document.getElementById('bookmark-url-input');
  const categorySelect = document.getElementById('bookmark-category-select');
  
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();
  const categoryId = categorySelect.value;
  
  if (!title || !url) {
    alert('Please enter both title and URL');
    return;
  }
  
  if (!categoryId) {
    alert('Please select a category');
    return;
  }
  
  // Validate URL
  try {
    new URL(url);
  } catch {
    alert('Please enter a valid URL');
    return;
  }
  
  if (currentEditingBookmark) {
    // Edit existing bookmark
    const index = bookmarks.findIndex(b => b.id === currentEditingBookmark.id);
    bookmarks[index] = {
      ...bookmarks[index],
      title,
      url,
      categoryId
    };
  } else {
    // Add new bookmark
    const newBookmark = {
      id: 'bm_' + Date.now(),
      title,
      url,
      categoryId,
      createdAt: Date.now()
    };
    bookmarks.push(newBookmark);
  }
  
  await Storage.set('bookmarks', bookmarks);
  renderCategories();
  closeBookmarkModal();
}

async function deleteBookmark(bookmarkId) {
  const confirmDeleteBookmark = await Storage.get('confirmDeleteBookmark');
  if (confirmDeleteBookmark && !confirm('Are you sure you want to delete this bookmark?')) {
    return;
  }
  
  bookmarks = bookmarks.filter(b => b.id !== bookmarkId);
  await Storage.set('bookmarks', bookmarks);
  renderCategories();
}

// Drag and Drop
let draggedBookmark = null;
let draggedCategory = null;
let autoScrollInterval = null;

// Category drag handlers
function handleCategoryDragStart(e) {
  // Only allow dragging by the category itself, not when dragging bookmarks
  if (e.target.classList.contains('bookmark-card')) {
    e.stopPropagation();
    return;
  }
  
  draggedCategory = e.currentTarget.dataset.categoryId;
  e.currentTarget.classList.add('dragging-category');
  e.dataTransfer.effectAllowed = 'move';
  
  // Start auto-scroll detection
  document.addEventListener('dragover', autoScroll);
}

function handleCategoryDragEnd(e) {
  e.currentTarget.classList.remove('dragging-category');
  document.querySelectorAll('.category').forEach(cat => {
    cat.classList.remove('drag-over');
  });
  draggedCategory = null;
  
  // Stop auto-scroll
  document.removeEventListener('dragover', autoScroll);
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

function handleCategoryDragOver(e) {
  e.preventDefault();
  
  // If dragging a category
  if (draggedCategory) {
    const currentCategory = e.currentTarget;
    if (currentCategory.dataset.categoryId !== draggedCategory) {
      currentCategory.classList.add('drag-over');
    }
    return;
  }
  
  // If dragging a bookmark (existing behavior)
  if (draggedBookmark) {
    const category = e.currentTarget;
    category.classList.add('drag-over');
  }
}

async function handleCategoryDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const targetCategory = e.currentTarget;
  targetCategory.classList.remove('drag-over');
  
  // If dropping a category (reordering categories)
  if (draggedCategory) {
    const targetCategoryId = targetCategory.dataset.categoryId;
    
    if (draggedCategory !== targetCategoryId) {
      const draggedIndex = categories.findIndex(c => c.id === draggedCategory);
      const targetIndex = categories.findIndex(c => c.id === targetCategoryId);
      
      // Remove dragged category from its position
      const [draggedCat] = categories.splice(draggedIndex, 1);
      
      // Insert at new position
      categories.splice(targetIndex, 0, draggedCat);
      
      await Storage.set('categories', categories);
      renderCategories();
    }
    return;
  }
  
  // If dropping a bookmark (existing behavior)
  if (draggedBookmark) {
    const newCategoryId = targetCategory.dataset.categoryId;
    const bookmark = bookmarks.find(b => b.id === draggedBookmark);
    
    if (bookmark) {
      bookmark.categoryId = newCategoryId;
      await Storage.set('bookmarks', bookmarks);
      renderCategories();
    }
  }
}

function handleDragStart(e) {
  e.stopPropagation(); // Prevent category drag
  draggedBookmark = e.target.dataset.bookmarkId;
  e.target.classList.add('dragging');
  
  // Start auto-scroll detection
  document.addEventListener('dragover', autoScroll);
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.category').forEach(cat => {
    cat.classList.remove('drag-over');
  });
  
  // Stop auto-scroll
  document.removeEventListener('dragover', autoScroll);
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

function autoScroll(e) {
  const scrollZone = 80; // pixels from edge to trigger scroll
  const scrollSpeed = 10; // pixels per interval
  const viewportHeight = window.innerHeight;
  const mouseY = e.clientY;
  
  // Clear any existing interval
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  
  // Scroll up
  if (mouseY < scrollZone) {
    autoScrollInterval = setInterval(() => {
      window.scrollBy(0, -scrollSpeed);
    }, 16); // ~60fps
  }
  // Scroll down
  else if (mouseY > viewportHeight - scrollZone) {
    autoScrollInterval = setInterval(() => {
      window.scrollBy(0, scrollSpeed);
    }, 16);
  }
}

function handleDragLeave(e) {
  const category = e.currentTarget;
  category.classList.remove('drag-over');
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    document.querySelectorAll('.bookmark-card').forEach(card => {
      const title = card.querySelector('.bookmark-title').textContent.toLowerCase();
      const url = card.querySelector('.bookmark-url').textContent.toLowerCase();
      
      if (title.includes(query) || url.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Event listeners
function setupEventListeners() {
  // View toggle
  document.getElementById('toggle-view-btn').onclick = toggleView;
  
  // Dark mode toggle
  document.getElementById('toggle-dark-btn').onclick = toggleDarkMode;
  
  // Category modal
  document.getElementById('add-category-btn').onclick = () => openCategoryModal();
  document.getElementById('save-category-btn').onclick = saveCategory;
  document.getElementById('cancel-category-btn').onclick = closeCategoryModal;
  
  // Bookmark modal
  document.getElementById('save-bookmark-btn').onclick = saveBookmark;
  document.getElementById('cancel-bookmark-btn').onclick = closeBookmarkModal;
  
  // Close modals on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
  
  // Import/Export
  document.getElementById('import-btn').onclick = openImportModal;
  document.getElementById('export-btn').onclick = exportBookmarks;
  
  // Help modal
  document.getElementById('help-btn').onclick = () => {
    document.getElementById('help-modal').classList.remove('hidden');
  };
  document.getElementById('close-help-btn').onclick = () => {
    document.getElementById('help-modal').classList.add('hidden');
  };
  
  // ESC key to close modals, Enter key to save
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
      });
    }
    if (e.key === 'Enter') {
      const categoryModal = document.getElementById('category-modal');
      const bookmarkModal = document.getElementById('bookmark-modal');
      const importModal = document.getElementById('import-modal');
      
      if (!categoryModal.classList.contains('hidden')) {
        e.preventDefault();
        saveCategory();
      } else if (!bookmarkModal.classList.contains('hidden')) {
        e.preventDefault();
        saveBookmark();
      } else if (!importModal.classList.contains('hidden')) {
        e.preventDefault();
        importBookmarks();
      }
    }
  });
}

// Import/Export functionality
function openImportModal() {
  const modal = document.getElementById('import-modal');
  modal.classList.remove('hidden');
  
  document.getElementById('confirm-import-btn').onclick = importBookmarks;
  document.getElementById('cancel-import-btn').onclick = () => {
    modal.classList.add('hidden');
  };
}

async function importBookmarks() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a file');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    const content = e.target.result;
    
    try {
      if (file.name.endsWith('.json')) {
        // Import JSON format
        const data = JSON.parse(content);
        if (data.categories && data.bookmarks) {
          categories = data.categories;
          bookmarks = data.bookmarks;
        }
      } else if (file.name.endsWith('.html')) {
        // Import HTML bookmark format (basic parser)
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const links = doc.querySelectorAll('a');
        
        links.forEach(link => {
          const newBookmark = {
            id: 'bm_' + Date.now() + '_' + Math.random(),
            title: link.textContent,
            url: link.href,
            categoryId: 'new',
            createdAt: Date.now()
          };
          bookmarks.push(newBookmark);
        });
      }
      
      await Storage.set('categories', categories);
      await Storage.set('bookmarks', bookmarks);
      
      renderCategories();
      document.getElementById('import-modal').classList.add('hidden');
      alert('Bookmarks imported successfully!');
    } catch (error) {
      alert('Error importing bookmarks: ' + error.message);
    }
  };
  
  reader.readAsText(file);
}

async function exportBookmarks() {
  const data = {
    categories,
    bookmarks,
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookmarks-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// View toggle
async function toggleView() {
  viewMode = viewMode === 'list' ? 'grid' : 'list';
  await Storage.set('viewMode', viewMode);
  renderCategories();
  updateViewButton();
}

function updateViewButton() {
  const btn = document.getElementById('toggle-view-btn');
  const icon = document.getElementById('view-icon');
  
  if (viewMode === 'grid') {
    icon.textContent = '☰';
    btn.innerHTML = '<span id="view-icon">☰</span> List View';
  } else {
    icon.textContent = '▦';
    btn.innerHTML = '<span id="view-icon">▦</span> Grid View';
  }
}

// Dark mode
async function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
  await Storage.set('darkMode', darkMode);
  updateDarkModeButton();
}

function updateDarkModeButton() {
  const btn = document.getElementById('toggle-dark-btn');
  if (darkMode) {
    btn.innerHTML = '☀️ Light';
  } else {
    btn.innerHTML = '🌙 Dark';
  }
}

// Collapsible categories
async function toggleCollapse(categoryId) {
  collapsedCategories[categoryId] = !collapsedCategories[categoryId];
  await Storage.set('collapsedCategories', collapsedCategories);
  renderCategories();
}
