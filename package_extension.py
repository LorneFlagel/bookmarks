"""
Package extension for both Firefox and Chrome/Chromium
"""
import zipfile
import os
import json
import shutil

# Shared files used by both browsers
SHARED_FILES = [
    'newtab.html',
    'newtab.js',
    'popup.html',
    'popup.js',
    'background.js',
    'styles.css',
    'options.html',
    'options.js',
    'browser-polyfill.min.js'
]

ICON_FILES = [
    'icons/icon-16.png',
    'icons/icon-32.png',
    'icons/icon-48.png',
    'icons/icon-96.png'
]


def build_package(manifest_file, output_file, label):
    """Create a zip/xpi package with the given manifest."""
    files = [manifest_file] + SHARED_FILES

    if os.path.exists(output_file):
        os.remove(output_file)

    print(f"\n{'='*50}")
    print(f"  Building {label}: {output_file}")
    print(f"{'='*50}")

    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file in files:
            if os.path.exists(file):
                # manifest.chrome.json -> manifest.json in the archive
                arcname = 'manifest.json' if file.endswith('manifest.chrome.json') else file
                zipf.write(file, arcname.replace('\\', '/'))
                print(f"  ✓ {arcname}")
            else:
                print(f"  ✗ Missing {file}")

        for file in ICON_FILES:
            if os.path.exists(file):
                zipf.write(file, file.replace('\\', '/'))
                print(f"  ✓ {file}")
            else:
                print(f"  ✗ Missing {file}")

    size = os.path.getsize(output_file)
    print(f"\n  ✅ {output_file} ({size:,} bytes)")


def create_extension_packages():
    """Build packages for both Firefox and Chrome."""

    # Firefox (.xpi) - uses manifest.json (MV2)
    build_package('manifest.json', 'bookmarks-extension.xpi', 'Firefox (MV2)')

    # Chrome (.zip) - uses manifest.chrome.json (MV3)
    build_package('manifest.chrome.json', 'bookmarks-extension-chrome.zip', 'Chrome/Chromium (MV3)')

    print(f"\n{'='*50}")
    print("  All builds complete!")
    print(f"{'='*50}")
    print("\n  Firefox:  bookmarks-extension.xpi")
    print("            Submit to addons.mozilla.org")
    print("\n  Chrome:   bookmarks-extension-chrome.zip")
    print("            Submit to chrome.google.com/webstore")
    print("            Or load unpacked via chrome://extensions\n")


if __name__ == '__main__':
    try:
        create_extension_packages()
    except Exception as e:
        print(f"❌ Error: {e}")
