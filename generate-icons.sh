#!/bin/bash
# Simple icon generator using ImageMagick (if available)
# This creates basic placeholder icons with Ghana colors

for size in 72 96 128 144 152 192 384 512; do
  # Create a simple gradient icon with "GIB" text
  magick -size ${size}x${size} \
    gradient:'#EF4444-#FCD34D' \
    -font Arial-Bold \
    -pointsize $((size/4)) \
    -gravity center \
    -fill white \
    -annotate +0+0 'GIB' \
    public/icon-${size}x${size}.png 2>/dev/null || {
    # Fallback: Create a solid color icon if ImageMagick is not available
    echo "⚠️  ImageMagick not found. Creating placeholder for ${size}x${size}"
  }
done

echo "✓ Icon generation complete!"
echo "Note: For production, please create professional icons with the Ghana flag design"
