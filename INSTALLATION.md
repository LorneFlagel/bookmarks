# Making the Extension Permanent

## The Problem
When you load an extension via "Load Temporary Add-on" in regular Firefox, it's removed when Firefox restarts. This is by design.

## Solutions

### Option 1: Firefox Developer Edition (Recommended)
1. Download [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/)
2. Open Firefox Developer Edition
3. Go to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on..."
5. Navigate to your extension folder and select `manifest.json`
6. **Important:** While this says "Temporary", in Developer Edition with the right settings, you can make it persist:
   - Go to `about:config`
   - Search for `extensions.autoDisableScopes` and set it to `0`
   - Search for `xpinstall.signatures.required` and set it to `false`
   - Reload the extension from `about:debugging`

**Alternative for Developer Edition (If above doesn't work):**
Since Firefox heavily restricts unsigned extensions, the easiest approach is to keep the extension loaded via `about:debugging` and just leave Firefox open, or reload it when you restart (takes 5 seconds).

### Option 2: Package and Sign (For Regular Firefox)
To use in regular Firefox permanently, you need to submit it to Mozilla:

1. Create a ZIP file of your extension:
   ```powershell
   # In the bookmarks directory
   Compress-Archive -Path manifest.json,newtab.html,newtab.js,popup.html,popup.js,background.js,styles.css,icons -DestinationPath bookmarks-extension.zip
   ```

2. Go to [addons.mozilla.org](https://addons.mozilla.org/developers/)
3. Create an account and submit your extension
4. Mozilla will review and sign it (can take a few days)
5. Once signed, install the .xpi file they provide

### Option 3: Self-Distribution (Advanced)
1. Get signing keys from Mozilla
2. Use `web-ext sign` command
3. Install the signed .xpi file

### Quick Workaround
For development, just reload the extension each time you start Firefox:
- Go to `about:debugging#/runtime/this-firefox`
- Click "Load Temporary Add-on"
- Select `manifest.json`

This takes 5 seconds and works fine for personal use.

## Recommendation
If this is just for personal use, Firefox Developer Edition is your best option. It's free, stable, and allows unsigned extensions to persist.
