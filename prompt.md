Act as a senior full-stack engineer and product-minded UI developer.

Context:
- Repo is a web-based kitchen planner (Three.js) currently running on shared hosting (cPanel).
- It works, but it feels “prototype-ish”. I want it to feel like modern kitchen planners: easier to draw, snapping, dimension overlays, kitchen-specific items (base/wall units, tall units, appliances), save/load designs, share links, export.
- I’m OK adding Node tooling for build/dev, and a PHP + MySQL backend for persistence (Composer allowed). Production must still run on shared hosting (no Node runtime required in production).

Hard constraints:
- Production deployment: static files + PHP endpoints on cPanel. Node is build-time only.
- Must keep it incremental: each step should leave the app working.
- Avoid massive rewrites in one go. Prefer a migration plan + staged PR-style commits.
- Keep existing functionality (2D floorplan + 3D view) working while improving.

Deliverables:
1) Create docs:
   - docs/ROADMAP.md (milestones with checklists)
   - docs/ARCHITECTURE.md (current vs target)
   - docs/LOCAL_DEV.md (how to run locally)
2) Add a modern dev/build workflow:
   - Use Vite (or similar) so modules/imports are clean
   - Output a /dist build that can be deployed to cPanel
   - Keep a “no-build fallback” path documented if possible, but main path is Vite
3) Kitchen-planner UX improvements:
   - Grid + snapping (e.g. 10mm / 25mm steps)
   - Numeric input for wall lengths (type dimensions instead of only drag)
   - Always-visible dimension overlay in 2D
   - Undo/redo (Ctrl+Z / Ctrl+Y)
   - Better toolbar + left panel layout (items, materials, dimensions)
4) Kitchen-specific catalogue:
   - Add categories: Base units, Wall units, Tall units, Appliances, Sinks/Taps, Islands, Accessories
   - Provide parametric “box” models as a minimum (so we don’t rely on external 3D models initially):
     e.g. cabinets are configurable width/depth/height, with door style and colour
   - Keep current “items.js” approach but refactor into a structured JSON catalogue, search/filter, and thumbnails
5) Persistence & sharing:
   - Add PHP API endpoints under /api:
     - POST /api/projects (create)
     - GET /api/projects/{id}
     - PUT /api/projects/{id}
     - GET /api/projects?limit=…
   - Store serialized design JSON + optional thumbnail + timestamps in MySQL
   - Use a random token/slug for share links (no login needed initially)
6) Export:
   - Export 2D plan to PNG
   - Export “spec sheet” PDF (basic: room dims + list of units/appliances + sizes)
   - Export project JSON backup
7) Code quality:
   - Break the large JS into modules (/src), keep a clean entrypoint
   - Add basic linting/formatting (ESLint/Prettier) only if it won’t slow down deployment

How to proceed:
- First, inspect the repo and summarize current structure.
- Then propose a step-by-step migration plan (Milestone 1..N).
- Implement Milestone 1 completely (Vite setup + refactor entrypoint) without breaking the app.
- Commit changes in small logical commits. After each milestone, provide a short “How to test” checklist.

Important: Avoid adding dependencies that require server daemons (Redis etc.). MySQL + PHP is fine.
