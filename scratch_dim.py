import sys
from PIL import Image

for file in ["public/images/ads/C1.png", "public/images/ads/C2.png"]:
    img = Image.open(file)
    print(f"{file}: {img.size}")
