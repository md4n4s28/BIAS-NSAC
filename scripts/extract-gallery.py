import sys, pathlib, hashlib
sys.path.insert(0, '/tmp/astro-pdf')
import fitz
from PIL import Image
import io
seen = set()
count = 0
for source in sorted(pathlib.Path('public/supplied').glob('*.pdf')):
    document = fitz.open(source)
    for page in document:
        for item in page.get_images(full=True):
            data = document.extract_image(item[0])
            if data['width'] < 400 or data['height'] < 300:
                continue
            digest = hashlib.sha256(data['image']).hexdigest()
            if digest in seen:
                continue
            seen.add(digest)
            count += 1
            image = Image.open(io.BytesIO(data['image'])).convert('RGB')
            image.thumbnail((1800, 1800))
            image.save(f'public/gallery/event-{count:02}.jpeg', quality=88, optimize=True)
print(f'Extracted {count} unique supplied photographs.')
