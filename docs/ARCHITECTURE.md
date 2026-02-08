# Architecture

## Current
- Static HTML page with CDN-loaded jQuery, Bootstrap, dat.GUI
- Core planner logic in JavaScript (Three.js) loaded in the browser
- Models, textures, and thumbnails served as static assets
- Local-only persistence via localStorage

## Target
- Vite-based build for module bundling and cleaner entrypoint
- /dist output deployable to cPanel as static assets + PHP APIs
- Modularized JS under /src
- Optional no-build fallback using index.static.html + import maps

## Notes
- Production remains static files + PHP endpoints (no Node runtime required)
- Keep changes incremental to avoid breaking the planner
