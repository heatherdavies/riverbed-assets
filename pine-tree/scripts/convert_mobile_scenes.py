from pathlib import Path
from PIL import Image

assets = Path('/home/ubuntu/riverbed-assets/pine-tree/assets')
for stem in ('day-01-seed-buried', 'day-03-seedling-reveal'):
    source = assets / f'{stem}.png'
    target = assets / f'{stem}.webp'
    image = Image.open(source).convert('RGB')
    image.save(target, 'WEBP', quality=82, method=6)
    print(f'{source.name} -> {target.name}: {target.stat().st_size} bytes')
