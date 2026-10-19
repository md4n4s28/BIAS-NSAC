from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from os import walk

root = Path(__file__).resolve().parent.parent
destination = root / 'public/downloads/astroverse-source.zip'
destination.parent.mkdir(parents=True, exist_ok=True)
excluded = {'.git', '.netlify', 'node_modules', 'dist', '.netlify-cache'}
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for directory, subdirectories, filenames in walk(root):
        subdirectories[:] = [name for name in subdirectories if name not in excluded]
        for filename in filenames:
            path = Path(directory) / filename
            if path.suffix == '.zip' or (path.name.startswith('.env') and path.name != '.env.example'):
                continue
            archive.write(path, path.relative_to(root))
print('Source archive packaged without secrets or dependencies.')
