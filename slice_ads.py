import os
from PIL import Image

def slice_image(file_path, cols, rows, output_prefix):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
        
    img = Image.open(file_path)
    width, height = img.size
    
    col_w = width // cols
    row_h = height // rows
    
    count = 1
    for r in range(rows):
        for c in range(cols):
            left = c * col_w
            top = r * row_h
            right = left + col_w
            bottom = top + row_h
            
            # Special case for C1.png bottom right (which is a double width ad)
            if "C1" in file_path and r == 2 and c == 2:
                # Keep it double width
                right = left + (col_w * 2)
                cropped = img.crop((left, top, right, bottom))
                cropped.save(f"public/images/ads/{output_prefix}_{count}.png")
                count += 1
                break # Skip the last column since we combined them
                
            cropped = img.crop((left, top, right, bottom))
            cropped.save(f"public/images/ads/{output_prefix}_{count}.png")
            count += 1

slice_image("public/images/ads/C1.png", 4, 3, "c1_ad")
slice_image("public/images/ads/C2.png", 4, 3, "c2_ad")

print("Slicing complete!")
