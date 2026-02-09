# Smart Bookmarks Manager 🔖

A powerful Firefox extension for managing bookmarks with a beautiful interface that replaces your new tab page.

## Features ✨

- **🆕 Quick Bookmarking**: Click the extension icon or right-click any page to quickly save bookmarks
- **📁 Category Management**: Organize bookmarks into custom categories
- **🏠 New Tab Override**: Your bookmarks become your homepage - see them every time you open a new tab
- **🔍 Smart Search**: Quickly find bookmarks by title or URL
- **📤 Import/Export**: Backup and restore your bookmarks using JSON format
- **🎨 Beautiful UI**: Modern, responsive design with smooth animations
- **🖱️ Drag & Drop**: Easily move bookmarks between categories
- **📌 Default "New" Category**: Quick-bookmarked pages go to a "New" list for later organization
- **🌙 Dark Mode**: Auto-detects system theme or set manually
- **📐 Grid / List Toggle**: Switch between list and 2-column grid view
- **🔽 Collapsible Categories**: Collapse categories to keep things tidy
- **⚙️ Options Page**: Configure theme and delete-confirmation behavior
- **⌨️ Keyboard Shortcut**: `Ctrl+Shift+.` to instantly bookmark the current page
- **🔄 Live Sync**: Changes sync instantly across all open new-tab pages

## Installation 🚀

### Method 1: Temporary Installation (For Testing)

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the extension folder and select the `manifest.json` file
4. The extension is now installed temporarily (will be removed when Firefox closes)

### Method 2: Permanent Installation (Requires Signing)

For permanent installation, you need to:
1. Package the extension as a `.xpi` file
2. Submit it to [addons.mozilla.org](https://addons.mozilla.org) for review and signing
3. Install the signed extension

Or use Firefox Developer Edition/Nightly with signing disabled:
1. Go to `about:config`
2. Set `xpinstall.signatures.required` to `false`
3. Package and install the extension

## Usage 📖

### Quick Bookmarking

**Method 1: Extension Popup**
- Click the extension icon in the toolbar
- The current page's title and URL will be pre-filled
- Select a category (defaults to "New")
- Click "Save Bookmark"

**Method 2: Keyboard Shortcut**
- Press **`Ctrl+Shift+.`** (Ctrl + Shift + Period) while on any page
- The page is instantly saved to the "New" category
- You'll see a notification confirming the bookmark was saved
- Note: Firefox's built-in shortcuts (`Ctrl+D`, `Ctrl+Shift+D`) cannot be overridden, which is why this combo is used

**Method 3: Context Menu**
- Right-click anywhere on a page
- Select "Quick Bookmark This Page"
- The bookmark is automatically saved to the "New" category

### Managing Bookmarks

When you open a new tab, you'll see your bookmark dashboard with:

1. **Search Bar**: Type to filter bookmarks by title or URL
2. **Categories**: All your bookmark categories displayed as cards
3. **Add Category**: Create new categories to organize your bookmarks
4. **Import/Export**: Backup or restore your bookmarks

### Organizing Bookmarks

- **Add Bookmark**: Click "+ Add Bookmark" in any category
- **Edit Bookmark**: Hover over a bookmark card and click the pencil icon
- **Delete Bookmark**: Hover over a bookmark card and click the trash icon
- **Move Between Categories**: Drag and drop bookmark cards between categories
- **Edit Category**: Click "Edit" on any category (except "New")
- **Delete Category**: Click "Delete" on any category (bookmarks move to "New")

### View Modes

- **List View** (default): Bookmarks displayed in a single-column list
- **Grid View**: 2-column grid layout — click the grid/list toggle button in the header to switch
- Your preference is saved and persists across sessions

### Collapsible Categories

- Click the **▼** arrow next to a category name to collapse/expand it
- Collapsed state is remembered across sessions

### Dark Mode 🌙

- Dark mode is **auto-detected** on first use based on your system preference
- Toggle it manually with the **🌙 / ☀️** button in the header
- Or set it in the **Options page** (right-click extension icon → Manage Extension → Preferences)

### Options / Settings ⚙️

Access the options page from `about:addons` → Smart Bookmarks Manager → Preferences:

| Setting | Default | Description |
|---------|---------|-------------|
| Dark Mode | Auto-detect | Light or dark theme |
| Confirm before deleting bookmarks | Off | Show a prompt before deleting a bookmark |
| Confirm before deleting categories | On | Show a prompt before deleting a category |

### Import/Export

**Export:**
- Click "📤 Export" in the header
- A JSON file will download with all your bookmarks and categories

**Import:**
- Click "📥 Import" in the header
- Select a JSON file (exported from this extension) or HTML bookmark file
- Your bookmarks will be imported

## File Structure 📂

```
bookmarks/
├── manifest.json          # Extension configuration
├── newtab.html           # New tab page HTML
├── newtab.js             # New tab page logic
├── popup.html            # Quick bookmark popup HTML
├── popup.js              # Quick bookmark popup logic
├── background.js         # Background script for context menus
├── styles.css            # Styles for new tab page
├── options.html          # Options/settings page HTML
├── options.js            # Options/settings page logic
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-96.png
└── README.md             # This file
```

## Data Storage 💾

All bookmark data is stored locally in Firefox using the `browser.storage.local` API. Your data includes:

- **categories**: Array of category objects
- **bookmarks**: Array of bookmark objects

Data structure:
```json
{
  "categories": [
    {
      "id": "new",
      "name": "New",
      "isDefault": true
    }
  ],
  "bookmarks": [
    {
      "id": "bm_1234567890",
      "title": "Example Site",
      "url": "https://example.com",
      "categoryId": "new",
      "createdAt": 1234567890
    }
  ]
}
```

## Customization 🎨

You can customize the extension by modifying:

- **styles.css**: Change colors, fonts, and layout
- **newtab.js**: Modify behavior and functionality
- **manifest.json**: Update extension name, description, and permissions

## Browser Compatibility 🌐

This extension is designed for **Firefox** and uses the WebExtensions API. To adapt it for Chrome/Edge:

1. Change `browser` to `chrome` in all JavaScript files
2. Update `chrome_url_overrides` in manifest.json
3. Adjust any Firefox-specific APIs

## Development 🛠️

### Prerequisites
- Firefox Developer Edition or Firefox Nightly (recommended)
- Text editor or IDE

### Making Changes
1. Edit the source files
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Reload" on your extension
4. Open a new tab to see your changes

### Adding Icons
Place icon files (PNG format) in the `icons/` directory:
- `icon-16.png` - 16x16 pixels
- `icon-32.png` - 32x32 pixels
- `icon-48.png` - 48x48 pixels
- `icon-96.png` - 96x96 pixels

## Known Limitations ⚠️

- Icons must be added manually (placeholder names in manifest)
- HTML bookmark import is basic (doesn't preserve folder structure)
- No cloud sync between devices (local storage only)
- No bookmark deduplication on import

## Future Enhancements 🚀

Potential features to add:
- ☁️ Cloud sync across devices
- 🏷️ Tags and advanced filtering
- 📊 Usage statistics and most-visited bookmarks
- 🔒 Password-protected categories
- 🔄 Auto-backup scheduling
- 📱 Mobile-responsive design
- 🎯 Smart bookmark suggestions
- 🔗 Duplicate detection

## Troubleshooting 🔧

**Extension doesn't load:**
- Check that all file paths in manifest.json are correct
- Ensure all required files exist
- Check browser console for errors

**New tab doesn't change:**
- Make sure the extension is enabled
- Check permissions in `about:addons`
- Try reloading the extension

**Bookmarks not saving:**
- Check browser storage permissions
- Clear storage and try again
- Check browser console for errors

## Contributing 🤝

Feel free to modify and improve this extension! Some areas for contribution:
- Add better error handling
- Improve import/export formats
- Add more customization options
- Create proper icon assets
- Implement undo/redo functionality

## License 📄

This is a personal project created for bookmark management. Feel free to use, modify, and distribute as needed.

## Support 💬

For issues or questions:
1. Check the browser console for errors (F12)
2. Review the code comments for understanding
3. Modify the extension to fit your needs

---

**Enjoy organizing your bookmarks! 🎉**
