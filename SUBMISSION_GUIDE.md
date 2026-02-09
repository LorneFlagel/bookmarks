# Submitting Your Extension to Firefox Add-ons

## Prerequisites

Before submitting, you need:
1. ✅ Working extension (you have this!)
2. ⚠️ Icon files (currently missing - see below)
3. ✅ Clear description and screenshots
4. ✅ Mozilla account

## Step 1: Create Icon Files

You need actual PNG icon files. Run this after installing Pillow:

```powershell
pip install Pillow
python generate_icons.py
```

Or create them manually and place in the `icons/` folder:
- icon-16.png (16x16 pixels)
- icon-32.png (32x32 pixels)
- icon-48.png (48x48 pixels)
- icon-96.png (96x96 pixels)

## Step 2: Package Your Extension

Create a ZIP file with all your extension files:

```powershell
# Remove any old ZIP files first
Remove-Item bookmarks-extension.zip -ErrorAction SilentlyContinue

# Create the package (excluding unnecessary files)
Compress-Archive -Path manifest.json,newtab.html,newtab.js,popup.html,popup.js,background.js,styles.css,icons -DestinationPath bookmarks-extension.zip
```

**Important:** The ZIP should NOT contain a folder - the manifest.json should be at the root level.

## Step 3: Create Mozilla Developer Account

1. Go to https://addons.mozilla.org
2. Click "Log in" (top right)
3. Create a Firefox Account if you don't have one
4. Verify your email address

## Step 4: Submit Your Extension

1. Go to https://addons.mozilla.org/developers/addon/submit/distribution
2. Choose **"On this site"** (for public listing) or **"On your own"** (for self-distribution)
3. Click "Continue"

### Upload Your Extension
1. Click "Select a file..." and choose your `bookmarks-extension.zip`
2. Mozilla will automatically validate it
3. Fix any errors if they appear (warnings are usually okay)

### Fill Out Listing Information

**Required Fields:**
- **Name:** Smart Bookmarks Manager
- **Summary:** Organize your bookmarks with ease. Quick bookmark sites and manage them later with categories.
- **Description:**
  ```
  A powerful bookmark manager that replaces your new tab page with a beautiful, organized view of all your bookmarks.

  Features:
  • Quick bookmark with keyboard shortcut (Alt+Shift+D) or toolbar icon
  • Organize bookmarks into custom categories
  • Drag and drop to reorder bookmarks and categories
  • Search functionality to quickly find bookmarks
  • Import/Export bookmarks (JSON format)
  • Switch between list and 2-column grid view
  • All bookmarks visible every time you open a new tab
  • Clean, modern interface with smooth animations

  Perfect for anyone who wants better bookmark organization without the clutter!
  ```

- **Categories:** Choose relevant ones (e.g., "Bookmarks", "Productivity")
- **Support Email:** Your email address
- **License:** Choose one (MIT or Mozilla Public License 2.0 are common)

**Optional but Recommended:**
- **Homepage:** Your GitHub repo or personal site
- **Screenshots:** Take 1-3 screenshots showing your extension in action
- **Privacy Policy:** If you collect any data (you don't, so you can skip this)

### Version Notes
For version 1.0.0, you might write:
```
Initial release with core features:
- New tab override with bookmark display
- Quick bookmark functionality
- Category management
- Import/Export support
- Drag and drop reordering
- Keyboard shortcuts
```

## Step 5: Choose Review Channel

- **Listed:** Public on addons.mozilla.org (recommended)
- **Unlisted:** You distribute it yourself, Mozilla just signs it

For most users, choose **Listed**.

## Step 6: Submit for Review

1. Review all your information
2. Click "Submit Version"
3. Wait for Mozilla's automated validation
4. If it passes, it goes to manual review

## Step 7: Wait for Review

**Timeline:**
- Automated validation: Instant
- Manual review: Usually 1-7 days (sometimes longer)
- You'll receive email updates

**What Mozilla Reviews:**
- Code quality and security
- Permissions requested (yours are reasonable)
- User experience
- Policy compliance

## Step 8: After Approval

Once approved:
1. You'll receive an email notification
2. Your extension will be live on addons.mozilla.org
3. Users can install it directly from the store
4. It will auto-update when you release new versions

## Common Rejection Reasons (and How to Avoid)

❌ **Missing icons** - Make sure to generate them!
❌ **Unclear permissions** - Your permissions are well-justified
❌ **Minified code** - You don't have any, so you're good
❌ **External code loading** - You don't do this
❌ **Poor description** - Use the one provided above

## Updating Your Extension

To release updates:
1. Update version in manifest.json (e.g., 1.0.0 → 1.1.0)
2. Create new ZIP file
3. Go to your developer dashboard
4. Upload new version
5. Submit for review again

## Alternative: Self-Distribution

If you just want to use it yourself without public listing:

1. Submit as "Self-distributed"
2. Mozilla will sign it and give you a .xpi file
3. Install the .xpi in any Firefox
4. It will persist across restarts
5. No public listing needed

This is faster (usually approved within hours) and perfect for personal use.

## Quick Command Reference

```powershell
# Install Pillow for icons
pip install Pillow

# Generate icons
python generate_icons.py

# Create ZIP package
Compress-Archive -Path manifest.json,newtab.html,newtab.js,popup.html,popup.js,background.js,styles.css,icons -DestinationPath bookmarks-extension.zip -Force

# Verify ZIP contents
Expand-Archive bookmarks-extension.zip -DestinationPath temp-verify
dir temp-verify
Remove-Item temp-verify -Recurse
```

## Resources

- Mozilla Developer Portal: https://addons.mozilla.org/developers/
- Extension Workshop: https://extensionworkshop.com/
- Add-on Policies: https://extensionworkshop.com/documentation/publish/add-on-policies/
- Submission Guide: https://extensionworkshop.com/documentation/publish/submitting-an-add-on/

## Need Help?

If you get stuck during submission:
1. Check the Extension Workshop docs
2. Post in Mozilla's Add-ons forum
3. Review validation errors carefully - they usually tell you exactly what to fix

---

**Recommendation:** Start with self-distribution to get it signed quickly for personal use. If you want to share it publicly later, you can always submit for public listing afterward.
