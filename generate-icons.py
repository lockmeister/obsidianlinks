#!/usr/bin/env -S uv run --script .
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "pillow",
# ]
# ///

from PIL import Image, ImageDraw

def create_icon(size):
    # Create image with purple background matching theme
    img = Image.new('RGB', (size, size), '#7c3aed')
    draw = ImageDraw.Draw(img)

    # Draw a stylized "O" (for Obsidian) with link chain symbolism
    # Outer circle
    margin = size // 8
    draw.ellipse([margin, margin, size - margin, size - margin],
                 outline='#ffffff', width=size // 16)

    # Inner circle (making it a ring/link)
    inner_margin = size // 4
    draw.ellipse([inner_margin, inner_margin, size - inner_margin, size - inner_margin],
                 fill='#7c3aed', outline='#ffffff', width=size // 20)

    # Add a small link/chain element on the side
    link_size = size // 6
    link_x = size - margin - link_size
    link_y = size // 2 - link_size // 2
    draw.ellipse([link_x, link_y, link_x + link_size, link_y + link_size],
                 outline='#ffffff', width=size // 24)

    return img

# Generate icons
icon_192 = create_icon(192)
icon_512 = create_icon(512)

icon_192.save('icon-192.png', 'PNG')
icon_512.save('icon-512.png', 'PNG')

print("Icons generated: icon-192.png, icon-512.png")
