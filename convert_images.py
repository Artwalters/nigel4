#!/usr/bin/env python3
"""
Image converter script to convert all images to WebP format with compression
"""

import os
import sys
from PIL import Image, ImageOps
import glob

def convert_to_webp(input_path, output_path, quality=80, max_width=1920):
    """
    Convert image to WebP format with compression and resizing
    """
    try:
        # Open image
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Auto-orient based on EXIF data
            img = ImageOps.exif_transpose(img)
            
            # Resize if image is too large
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                print(f"  Resized to {max_width}x{new_height}")
            
            # Save as WebP with optimization
            img.save(output_path, 
                    'WebP', 
                    quality=quality, 
                    optimize=True,
                    method=6)  # Best compression method
            
            # Get file sizes for comparison
            original_size = os.path.getsize(input_path)
            new_size = os.path.getsize(output_path)
            savings = (1 - new_size/original_size) * 100
            
            print(f"  Original: {original_size/1024/1024:.1f}MB")
            print(f"  New: {new_size/1024/1024:.1f}MB")
            print(f"  Savings: {savings:.1f}%")
            
    except Exception as e:
        print(f"  Error: {str(e)}")
        return False
    
    return True

def main():
    # Get the directory where script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    img_dir = os.path.join(script_dir, 'img')
    
    if not os.path.exists(img_dir):
        print("Error: img directory not found!")
        return
    
    # Find all image files
    image_extensions = ['*.jpg', '*.JPG', '*.jpeg', '*.JPEG', '*.png', '*.PNG']
    image_files = []
    
    for extension in image_extensions:
        image_files.extend(glob.glob(os.path.join(img_dir, extension)))
    
    if not image_files:
        print("No image files found!")
        return
    
    print(f"Found {len(image_files)} image files to convert:")
    
    # Convert each image
    converted_count = 0
    for img_path in image_files:
        filename = os.path.basename(img_path)
        name_without_ext = os.path.splitext(filename)[0]
        
        # Create output filename
        output_filename = f"{name_without_ext}.webp"
        output_path = os.path.join(img_dir, output_filename)
        
        print(f"\nConverting: {filename}")
        
        # Determine quality based on image type/size
        file_size_mb = os.path.getsize(img_path) / 1024 / 1024
        if file_size_mb > 10:  # Very large files
            quality = 75
            max_width = 1600
        elif file_size_mb > 5:  # Large files
            quality = 80
            max_width = 1800
        else:  # Smaller files
            quality = 85
            max_width = 1920
        
        print(f"  Using quality: {quality}, max width: {max_width}")
        
        if convert_to_webp(img_path, output_path, quality, max_width):
            converted_count += 1
    
    print(f"\n✅ Successfully converted {converted_count}/{len(image_files)} images!")
    print("\n📝 Next steps:")
    print("1. Update HTML/CSS to use .webp extensions")
    print("2. Test the website")
    print("3. Remove old .jpg files if everything works")

if __name__ == "__main__":
    try:
        from PIL import Image, ImageOps
    except ImportError:
        print("Error: Pillow library not found!")
        print("Install it with: pip install Pillow")
        sys.exit(1)
    
    main()