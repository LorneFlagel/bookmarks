"""
Package Firefox extension with correct path separators
"""
import zipfile
import os

def create_extension_package():
    """Create XPI package with forward slashes for Firefox"""
    
    # Files to include
    files = [
        'manifest.json',
        'newtab.html',
        'newtab.js',
        'popup.html',
        'popup.js',
        'background.js',
        'styles.css',
        'options.html',
        'options.js'
    ]
    
    # Icon files
    icon_files = [
        'icons/icon-16.png',
        'icons/icon-32.png',
        'icons/icon-48.png',
        'icons/icon-96.png'
    ]
    
    output_file = 'bookmarks-extension.xpi'
    
    # Remove old package if exists
    if os.path.exists(output_file):
        os.remove(output_file)
    
    print(f"Creating {output_file}...")
    
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add main files
        for file in files:
            if os.path.exists(file):
                # Use forward slashes in archive
                zipf.write(file, file.replace('\\', '/'))
                print(f"  ✓ Added {file}")
            else:
                print(f"  ✗ Missing {file}")
        
        # Add icon files
        for file in icon_files:
            if os.path.exists(file):
                # Use forward slashes in archive
                zipf.write(file, file.replace('\\', '/'))
                print(f"  ✓ Added {file}")
            else:
                print(f"  ✗ Missing {file}")
    
    print(f"\n✅ Package created: {output_file}")
    print(f"📦 Size: {os.path.getsize(output_file):,} bytes")
    print("\nReady to submit to Mozilla!")

if __name__ == '__main__':
    try:
        create_extension_package()
    except Exception as e:
        print(f"❌ Error: {e}")
