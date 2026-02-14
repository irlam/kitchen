# Local Development

## Prereqs
- Node.js 18+ recommended

## Install
```
npm install
```

## Run with Vite
```
npm run dev
```

## Build for production
```
npm run build
```

- Output is written to /dist
- Static assets are copied by scripts/copy-static.js

## Add new catalog item assets to repo

Use the import script to copy or download item assets directly into local repo folders.

```bash
npm run import:item -- --name "My New Item" --model "https://example.com/item.glb" --image "https://example.com/item.png" --type 1 --format gltf --premium true --register true
```

What it does:
- Saves model to `models/gltf/`
- Saves thumbnail to `models/thumbnails_new/`
- Optionally appends an entry to `src/items.js` when `--register true` is used

Optional texture import (for assets that reference external texture files):

```bash
npm run import:item -- --name "Sheen Chair" --model "./downloads/sheenChair.glb" --image "./downloads/sheenChair.png" --textures "./downloads/chair_fabric_albedo.png,./downloads/chair_fabric_normal.png" --register true
```

Notes:
- If item registration is skipped, the script prints a ready-to-paste catalog snippet.
- Use `--slug your-file-name` to control generated file names.

## No-build fallback
- Serve the repository root with a static server
- Open index.static.html (uses import maps + /src entry)
