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

---

## Final product QA prompt (GitHub Copilot)

Use this prompt in Copilot Chat for a full pre-release verification pass:

"""
Act as a senior QA engineer + tech lead doing a final release-readiness review for this kitchen planner app.

Goal:
Verify the app is truly production-ready, with complete and correct dimensions in both 2D and 3D views, and that core workflows function end-to-end.

What I need from you:
1) Build a complete validation checklist first, then execute it.
2) Check ALL dimension rendering and calculations across the app:
   - 2D floorplan dimensions (walls, openings, objects, spacing, labels)
   - 3D view dimensions (if shown directly or via overlays/toggles)
   - unit consistency (mm/cm/in if supported), rounding, precision, scaling, zoom behavior
   - dimensions after move/rotate/resize, snap-to-grid, undo/redo, save/load
   - dimension visibility in normal state, selected state, and after scene refresh
3) Validate all key functions and user journeys:
   - create/edit room shape
   - add/move/rotate/delete items
   - collisions/snapping rules
   - catalog filtering/search
   - save project, reload, share links (if available)
   - exports (PNG/PDF/JSON if present)
   - toolbar/panel actions and keyboard shortcuts
4) Run a full test pass:
   - run lint/type checks/tests/build (use existing scripts in package.json)
   - report exact commands run and outcomes
   - if tests are missing, identify critical gaps and propose minimal high-value tests
5) Perform targeted code inspection for likely defects:
   - dimension math utilities
   - coordinate transforms between 2D and 3D
   - state sync issues between UI + scene
   - regressions caused by recent commits
6) Produce output in this exact structure:
   A. Release Readiness Score (0–100)
   B. Critical Issues (must-fix)
   C. High/Medium/Low issues
   D. Dimension Coverage Matrix (feature × status)
   E. Commands Executed + Results
   F. Recommended Fix Plan (prioritized)
   G. “Go/No-Go” recommendation

Rules:
- Be strict and evidence-based.
- Do not assume functionality works unless verified.
- For each issue include: severity, reproduction steps, expected vs actual, likely root cause, and suggested fix.
- If you cannot run something, explicitly state why and provide a fallback verification method.
"""


## Copilot implementation prompt: execute fixes from QA report

Use this in Copilot Chat after your QA report is done:

"""
Act as a senior staff engineer responsible for implementing and validating fixes from a completed release-readiness QA review.

Context:
- The QA review concluded NO-GO with critical issues.
- Critical issues to fix first:
  1) Security vulnerability in three.js dependency
  2) No automated tests present
  3) 3D dimensions not visible (labels hidden)
- Project is a kitchen planner with both 2D and 3D views; dimensions are a release-critical feature.

Your mission:
Implement fixes in safe, incremental phases, and keep the app working after each phase.

Execution rules:
1) Start by restating the plan as Phase 1 / Phase 2 / Phase 3 with acceptance criteria.
2) For each phase:
   - Inspect relevant files and identify exact code locations before editing.
   - Make the smallest viable change set.
   - Run validation commands after changes.
   - Summarize what changed, why, and risks.
3) Never claim success without evidence from commands/tests.
4) If blocked, provide fallback and next-best action.

Phase 1 (must-fix, release blocker):
A) Security remediation
   - Upgrade vulnerable dependencies (especially three.js) to a secure compatible version.
   - Resolve any breaking import/API changes.
   - Run build and smoke checks.
   - Output: dependency diff + compatibility notes.

B) 3D dimension visibility fix
   - Find where 3D labels/overlays are created and where visibility is toggled.
   - Ensure default behavior shows 3D dimensions when user is in 3D mode.
   - Preserve performance and avoid label clutter regression.
   - Add/adjust a UI toggle if needed, but default must satisfy QA requirement.
   - Output: before/after behavior + files changed.

C) Minimum automated test baseline
   - Add a lightweight test setup (Vitest or existing stack).
   - Add high-value tests for:
     1. dimension formatting/unit conversion
     2. dimension visibility state logic (2D vs 3D)
     3. one core interaction path (e.g., add item then dimension updates)
   - Ensure tests run in CI-friendly command.
   - Output: test files added + pass/fail evidence.

Phase 2 (high priority quality improvements):
- Fix precision/rounding inconsistencies in dimensions.
- Improve snap-to-grid reliability and collision edge cases.
- Add catalog search/filter tests if functionality exists.

Phase 3 (release hardening):
- Regression pass on save/load/share/export flows.
- Document known limitations and create release checklist.

Required output format for every response:
1) Current Phase
2) Files Inspected
3) Changes Made
4) Commands Run + Results
5) Acceptance Criteria Status (Pass/Fail)
6) Next Step

Definition of Done (for GO recommendation):
- No known high-severity dependency vulnerabilities in shipped dependencies.
- 3D dimensions are visible and verified in runtime checks.
- Automated tests exist and pass for critical dimension logic.
- Build succeeds and core user journeys smoke-tested.
"""

## Optional one-shot Copilot command for immediate first pass

"Please execute Phase 1 only: patch security dependencies, fix 3D dimension visibility defaults, add minimum tests for dimension logic, run build/tests, and return evidence in the required 6-section format."


