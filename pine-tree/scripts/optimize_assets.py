from pathlib import Path
from PIL import Image

ASSET_DIR = Path(__file__).resolve().parents[1] / "assets"
TARGET = (1080, 1920)

for source in sorted(ASSET_DIR.glob("*.png")):
    destination = source.with_suffix(".webp")
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail(TARGET, Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=88, method=6)
    print(f"{source.name} -> {destination.name}")
