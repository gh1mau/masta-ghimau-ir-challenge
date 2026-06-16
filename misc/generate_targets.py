#!/usr/bin/env python3
"""
Masta Ghimau IR Challenge - AR Target Image Generator
Author: Hussein Mohamed masta ghimau
YouTube: https://www.youtube.com/@mastaghimau
GitHub: https://github.com/gh1mau

This script generates simple target images for AR tracking.
For production use, use the MindAR Target Creator:
https://hiukim.github.io/mind-ar-js-doc/tools/compile/
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_target_image(challenge_id, title, output_dir="../assets/targets"):
    """Create a target image for a specific challenge."""
    
    # Create directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Image dimensions
    width, height = 512, 512
    
    # Create image with white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw border
    border_width = 20
    draw.rectangle([border_width, border_width, width-border_width, height-border_width], 
                   outline='#00ff41', width=10)
    
    # Draw inner pattern (unique for each challenge)
    colors = ['#00ff41', '#238636', '#f0883e', '#da3633', '#58a6ff', '#a371f7']
    color = colors[challenge_id % len(colors)]
    
    # Draw geometric pattern
    center_x, center_y = width // 2, height // 2
    
    # Draw circles
    for i in range(3):
        radius = 50 + i * 40
        draw.ellipse([center_x - radius, center_y - radius, 
                     center_x + radius, center_y + radius], 
                    outline=color, width=5)
    
    # Draw cross
    cross_size = 150
    draw.line([center_x - cross_size, center_y, center_x + cross_size, center_y], 
              fill=color, width=10)
    draw.line([center_x, center_y - cross_size, center_x, center_y + cross_size], 
              fill=color, width=10)
    
    # Draw challenge number
    try:
        font_large = ImageFont.truetype("arial.ttf", 120)
        font_small = ImageFont.truetype("arial.ttf", 40)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Challenge number
    number_text = str(challenge_id + 1)
    bbox = draw.textbbox((0, 0), number_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text((center_x - text_width//2, center_y - text_height//2 - 30), 
              number_text, fill=color, font=font_large)
    
    # Challenge title
    bbox = draw.textbbox((0, 0), title, font=font_small)
    text_width = bbox[2] - bbox[0]
    draw.text((center_x - text_width//2, height - 100), 
              title, fill=color, font=font_small)
    
    # Save image
    output_path = os.path.join(output_dir, f"challenge{challenge_id}.png")
    img.save(output_path)
    print(f"Created: {output_path}")
    
    return output_path

def create_all_targets():
    """Create target images for all challenges."""
    
    challenges = [
        "RANSOMWARE",
        "PHISHING", 
        "NETWORK",
        "MALWARE",
        "FORENSICS",
        "SOCIAL"
    ]
    
    print("Generating AR target images...")
    print("=" * 50)
    
    for i, title in enumerate(challenges):
        create_target_image(i, title)
    
    print("=" * 50)
    print("Target images generated successfully!")
    print("\nNOTE: To create .mind files for AR tracking:")
    print("1. Visit: https://hiukim.github.io/mind-ar-js-doc/tools/compile/")
    print("2. Upload the generated PNG files")
    print("3. Download the .mind files to assets/targets/")
    print("\nOr use the images directly with demo mode.")

if __name__ == "__main__":
    create_all_targets()
