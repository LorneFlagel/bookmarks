"""
Icon Generator for Smart Bookmarks Manager Extension
Generates PNG icons in multiple sizes with a bookmark design
"""

from PIL import Image, ImageDraw
import os

def create_bookmark_icon(size):
    """Create a bookmark icon of the specified size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions based on size
    padding = size // 8
    bookmark_width = size - (2 * padding)
    bookmark_height = size - padding
    
    # Define bookmark shape coordinates
    left = padding
    right = size - padding
    top = padding
    bottom = size - padding
    
    # Calculate the V-notch at bottom
    notch_depth = bookmark_height // 5
    center_x = size // 2
    
    # Create bookmark shape (rectangle with V-notch at bottom)
    points = [
        (left, top),                          # Top-left
        (right, top),                         # Top-right
        (right, bottom - notch_depth),        # Right side
        (center_x, bottom),                   # Bottom center (point of V)
        (left, bottom - notch_depth),         # Left side
        (left, top)                           # Back to top-left
    ]
    
    # Draw shadow for depth (slightly offset)
    shadow_offset = max(1, size // 32)
    shadow_points = [(x + shadow_offset, y + shadow_offset) for x, y in points]
    draw.polygon(shadow_points, fill=(0, 0, 0, 60))
    
    # Draw gradient effect by drawing multiple polygons with varying opacity
    # Main bookmark color (purple/blue gradient effect)
    colors = [
        (102, 126, 234, 255),   # Base purple-blue
        (118, 110, 234, 255),   # Slightly more purple
        (102, 126, 234, 255),   # Back to base
    ]
    
    # Draw main bookmark shape
    draw.polygon(points, fill=colors[0], outline=(80, 100, 200, 255))
    
    # Add inner highlight for 3D effect
    if size >= 32:
        highlight_points = [
            (left + 2, top + 2),
            (right - 2, top + 2),
            (right - 2, bottom - notch_depth - 2),
            (center_x, bottom - 2),
            (left + 2, bottom - notch_depth - 2),
            (left + 2, top + 2)
        ]
        draw.polygon(highlight_points, outline=(150, 160, 255, 100))
    
    # Add a bookmark "page" line detail
    if size >= 32:
        line_spacing = bookmark_height // 6
        line_left = left + bookmark_width // 4
        line_right = right - bookmark_width // 4
        
        for i in range(2):
            y = top + padding + (i + 1) * line_spacing
            draw.line([(line_left, y), (line_right, y)], 
                     fill=(255, 255, 255, 180), width=max(1, size // 32))
    
    return img

def generate_icons():
    """Generate all required icon sizes"""
    sizes = [16, 32, 48, 96]
    
    # Create icons directory if it doesn't exist
    icons_dir = 'icons'
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)
    
    print("Generating bookmark icons...")
    
    for size in sizes:
        icon = create_bookmark_icon(size)
        filename = f'icon-{size}.png'
        filepath = os.path.join(icons_dir, filename)
        icon.save(filepath, 'PNG')
        print(f"✓ Created {filename} ({size}x{size})")
    
    print("\n✅ All icons generated successfully!")
    print(f"📁 Icons saved in: {os.path.abspath(icons_dir)}")

if __name__ == '__main__':
    try:
        generate_icons()
    except ImportError:
        print("❌ Error: Pillow library not found!")
        print("📦 Install it with: pip install Pillow")
        print("   or: python -m pip install Pillow")
    except Exception as e:
        print(f"❌ Error generating icons: {e}")
