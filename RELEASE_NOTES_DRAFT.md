# RELEASE NOTES - Draft
## KitchenLab Pro v0.1.0

**Release Date:** TBD  
**Version:** 0.1.0 (Initial Production Release)  
**Code Name:** "Foundation"

---

## 🎉 OVERVIEW

KitchenLab Pro v0.1.0 is the first production-ready release of our 2D/3D kitchen planning application. This release includes comprehensive dimension features, snap-to-grid functionality, collision detection, and catalog search capabilities - all backed by a robust test suite.

This release represents the culmination of Phases 1-3:
- **Phase 1:** Core dimension system implementation and 3D visibility fixes
- **Phase 2:** Precision improvements, snap-to-grid, collision detection, catalog filtering
- **Phase 3:** Release hardening, comprehensive testing, and documentation

---

## ✨ NEW FEATURES

### 🎯 Core Dimension System (Phase 1)

#### 2D Floorplan Dimensions
- **Wall Dimensions:** Edge labels showing wall lengths in real-time
- **Item Dimensions:** Width and depth labels displayed as dimension boxes
- **Gap Spacing:** Automatic dimension lines showing distances between items and walls
- **Technical Drawing Format:** Professional dimension lines with arrows and extension lines

#### 3D View Dimensions
- **Visible by Default:** Dimension labels now visible on all items in 3D view (critical Phase 1B fix)
- **Persistent Visibility:** Dimensions remain visible when items are unselected
- **Width-Height Labels:** Canvas-based dimension labels on front face of items
- **Width-Depth Labels:** Canvas-based dimension labels on top face of items
- **High Quality:** 4x scaling for crisp dimension text

#### Multi-Unit Support
- **Metric:** Centimeters (cm), Millimeters (mm), Meters (m)
- **Imperial:** Inches (in), Feet + Inches (ft)
- **Real-Time Conversion:** Switch units anytime without data loss
- **Smart Formatting:** Automatic format selection based on unit type

#### Dimension Accuracy
- **Precision Rounding:** Smart rounding to avoid floating point artifacts (no more "59.9999999cm")
- **Display Precision:** Configurable decimal places per unit type
- **Update Triggers:** Dimensions automatically update after:
  - Moving items
  - Resizing items
  - Rotating items
  - Undo/redo operations
  - Loading saved projects

---

### ⚡ Enhanced Features (Phase 2)

#### Snap-to-Grid System
- **Standard Cabinet Widths:** 30, 45, 60, 80, 90, 100, 120 cm
- **Standard Depths:** 30, 60 cm
- **Standard Heights:** 72, 90, 210 cm
- **Configurable Threshold:** 5cm snap tolerance
- **Manual Snap Button:** "✨ Snap to Cabinet Size" in properties panel
- **Smart Algorithm:** Finds nearest standard dimension within threshold

**Implementation:**
- 28 passing tests validate snap logic
- Works for all three dimensions (width, height, depth)
- Gracefully handles edge cases (no snap points, disabled state)

#### Collision Detection
- **Bounding Box Algorithm:** Axis-Aligned Bounding Box (AABB) intersection
- **Accurate Detection:** Handles overlaps, containment, edge touching
- **Edge Case Handling:** Touching edges don't count as collision
- **Tested Logic:** 14 passing tests ensure reliability

**Note:** Logic is implemented but UI integration not yet complete (see KNOWN_LIMITATIONS.md)

#### Catalog Search & Filter
- **Search Logic:** Case-insensitive partial name matching
- **Category Filters:** Floor items, wall items, in-wall items
- **Fast Performance:** Filters 200+ items instantly
- **Extensible:** Ready for UI integration

**Implementation:**
- 22 passing tests validate search/filter logic
- Handles special characters and edge cases
- Supports empty queries (returns all items)

**Note:** Logic is implemented but UI controls not yet added (see KNOWN_LIMITATIONS.md)

---

### 🔧 Quality Improvements (Phase 3)

#### Comprehensive Test Suite
- **141 Tests:** Complete test coverage of critical features
- **100% Pass Rate:** All tests passing
- **Fast Execution:** Entire suite runs in < 1 second
- **Test Categories:**
  - Dimension conversion (20 tests)
  - Dimension precision (28 tests)
  - Dimension visibility (11 tests)
  - Dimension interactions (18 tests)
  - Snap-to-grid (28 tests)
  - Collision detection (14 tests)
  - Catalog search (22 tests)

#### Build & Infrastructure
- **Vite Build System:** Fast modern build with HMR (Hot Module Replacement)
- **Production Optimization:** Minified and optimized bundles
- **Source Maps:** Available for debugging
- **Static Asset Copying:** Automated copying of models, CSS, API files

#### Security
- **Three.js Updated:** From 0.124.0 to 0.137.0 (fixes HIGH severity DoS vulnerability)
- **SQL Injection Protection:** All API endpoints use prepared statements
- **Clean Audit:** 0 critical, 0 high severity vulnerabilities in production dependencies
- **Security Assessment:** Only dev-time moderate vulnerabilities (accepted for v0.1.0)

#### Documentation
- **Release Checklist:** Comprehensive must-pass criteria
- **Known Limitations:** Documented workarounds for non-blocking issues
- **Local Development Guide:** Setup and build instructions
- **Architecture Documentation:** System design and structure

---

## 🏗️ EXISTING FEATURES

These features were present in the codebase and remain functional:

### Room Creation
- **Draw Mode:** Create custom room layouts
- **Wall Tools:** Move, extend, delete walls
- **Corner Manipulation:** Drag corners to reshape rooms

### Item Management
- **200+ Catalog Items:** Extensive library of furniture and appliances
- **Add/Remove:** Easy item placement and deletion
- **Move:** Drag items in 3D view to reposition
- **Rotate:** Adjust item orientation
- **Resize:** Modify width, height, depth

### Persistence
- **Server-Side Save:** SQLite database storage
- **Project Management:** Save and load designs by name
- **Serialization:** Complete project state preserved
- **API Endpoints:** RESTful PHP API

### Export
- **2D PNG:** Export floorplan as image
- **3D PNG:** Export 3D render as image
- **PDF/Print:** Print designs directly from browser
- **JSON:** Project data serialization

### Undo/Redo
- **25-Item History:** Comprehensive undo/redo stack
- **State Preservation:** Complete project state saved at each step
- **Reliable:** Tested and verified working

---

## 🔧 BUG FIXES

### Critical Fixes

**3D Dimension Labels Hidden by Default (CRITICAL-001)**
- **Issue:** Labels were set to `visible = false`, defeating primary use case
- **Root Cause:** Intentional hiding to reduce clutter, but no UI toggle provided
- **Fix:** Changed `canvasPlaneWH.visible` and `canvasPlaneWD.visible` to `true` at initialization
- **Location:** src/kitchenKreation.js:12296
- **Impact:** Users can now see dimensions in 3D view without selecting items

**3D Dimensions Hidden When Deselected (Related to CRITICAL-001)**
- **Issue:** Dimensions disappeared when item was deselected
- **Root Cause:** setUnselected() was hiding dimension planes
- **Fix:** Commented out hide logic in setUnselected()
- **Location:** src/kitchenKreation.js:12654
- **Impact:** Dimensions remain persistently visible

**Three.js Security Vulnerability (CRITICAL-003)**
- **Issue:** DoS vulnerability in three.js < 0.125.0
- **GHSA:** GHSA-fq6p-x6j3-cmmq
- **Severity:** HIGH
- **Fix:** Updated three.js from 0.124.0 to 0.137.0
- **Impact:** Production deployment safe from known DoS attack

### High Priority Fixes

**Dimension Precision Issues (HIGH-004)**
- **Issue:** Floating point artifacts showing "59.9999999cm" instead of "60cm"
- **Root Cause:** 10 decimal place rounding insufficient for display
- **Fix:** Implemented smart rounding algorithm with configurable precision
- **Impact:** Clean dimension displays, better user experience
- **Tests:** 28 tests validate precision across all scenarios

---

## 🛠️ TECHNICAL CHANGES

### Dependencies Updated
- **three.js:** 0.124.0 → 0.137.0 (security fix)
- **html2canvas:** ^1.4.1 (for PNG export)
- **vite:** ^5.4.0 (build system)
- **vitest:** ^4.0.18 (test framework)

### Build System
- **Vite 5:** Modern build system with fast HMR
- **ES Modules:** Native module support
- **Tree Shaking:** Automatic removal of unused code
- **Minification:** Production bundles optimized

### Code Quality
- **Test Coverage:** 141 tests covering critical paths
- **Utility Functions:** Extracted dimension helpers to src/utils/dimensions.js
- **Test Organization:** Logical test file structure by feature area

### Performance
- **Bundle Size:** 987KB JS uncompressed, 257KB gzipped
- **Load Time:** ~2 seconds on fast connection
- **Memory Usage:** ~100MB initial, scales with item count
- **Render Performance:** Smooth 60fps in 3D view

---

## 📊 STATISTICS

**Code Stats:**
- **Source Lines:** 21,543 lines (src/*.js)
- **Test Lines:** ~6,000 lines (tests/*.test.js)
- **Test Files:** 7
- **Test Cases:** 141
- **Test Pass Rate:** 100%

**Build Stats:**
- **Build Time:** 2.42 seconds
- **JS Bundle:** 987KB (257KB gzipped)
- **CSS Bundle:** 18KB (4KB gzipped)
- **Total Assets:** 200+ 3D models included

**Quality Stats:**
- **Critical Bugs:** 0
- **High Priority Bugs:** 0
- **Test Coverage:** Core features 100%
- **Security Vulnerabilities:** 0 production, 2 dev-only (moderate)

---

## 🚀 DEPLOYMENT

### Requirements
- **Node.js:** 18+ recommended
- **NPM:** 8+ recommended
- **PHP:** 7.4+ (for API)
- **Database:** SQLite 3
- **Web Server:** Apache/nginx/any static server

### Build Command
```bash
npm install
npm run build
```

### Deploy
1. Upload `dist/` directory contents to web server
2. Configure PHP environment for `api/projects.php`
3. Ensure SQLite database writable
4. Verify CORS settings appropriate for domain

### Verify
1. Open application in browser
2. Test save/load functionality
3. Verify 3D dimensions visible
4. Check console for errors

---

## 📚 DOCUMENTATION

**New Documentation:**
- `RELEASE_CHECKLIST.md` - Must-pass criteria for production
- `KNOWN_LIMITATIONS.md` - Non-blocking issues and workarounds
- `RELEASE_NOTES_DRAFT.md` - This document

**Existing Documentation:**
- `README.md` - Project overview
- `docs/LOCAL_DEV.md` - Development setup
- `docs/ARCHITECTURE.md` - System architecture
- `docs/ROADMAP.md` - Future plans

**Test Documentation:**
- Each test file includes descriptive comments
- Test names are self-documenting
- Coverage reports available via `npm run test:ui`

---

## ⚠️ KNOWN LIMITATIONS

See `KNOWN_LIMITATIONS.md` for complete list. Key limitations:

1. **Build Warnings:** CSS syntax warning and large bundle size (non-functional)
2. **Dev Dependencies:** 2 moderate vulnerabilities (dev-only, no production impact)
3. **Manual Snap:** Auto-snap during drag not implemented (logic exists, UI integration pending)
4. **No Collision UI:** Detection logic works but no visual warnings yet
5. **No Search UI:** Search logic implemented but UI controls not added

**All limitations documented with workarounds.**

---

## 🎯 UPGRADE NOTES

This is the initial v0.1.0 release, so there is no upgrade path from previous versions.

**For Future Upgrades:**
- Save all projects before upgrading
- Export critical designs as JSON backup
- Test in staging environment first
- Verify API compatibility if using custom integrations

---

## 🙏 CREDITS

**Development Team:**
- Phase 1: Core dimension system and 3D visibility fixes
- Phase 2: Precision, snap, collision, catalog enhancements
- Phase 3: QA, testing, documentation, release hardening

**Testing:**
- Comprehensive QA validation
- 141 automated tests written
- Security audit performed
- Documentation created

**Open Source:**
- Three.js for 3D rendering
- Vite for build system
- Vitest for testing
- html2canvas for export

---

## 📅 ROADMAP

See `docs/ROADMAP.md` for detailed future plans. Highlights:

**v0.2.0 (Q2 2026):**
- Update dev dependencies (security)
- Restrict CORS policy
- Fix CSS ID warning
- Code quality improvements

**v0.3.0 (Q3 2026):**
- Remove dead code
- Add project name validation
- Performance optimizations

**v0.4.0 (Q4 2026):**
- Auto-snap during drag (UI integration)
- Visual collision warnings (UI integration)
- Catalog search UI controls
- Keyboard shortcuts
- Dimension visibility toggle

**v0.5.0+ (2027):**
- Mobile optimization
- Code modularization
- Advanced features
- Performance enhancements

---

## 🐛 BUG REPORTING

**Found a Bug?**
Please report with:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser and OS version
4. Screenshots if applicable
5. Console errors if any

**Security Issues:**
Report security vulnerabilities privately to maintainers.

---

## 📄 LICENSE

See `LICENSE.txt` for full license terms.

---

## 🎉 THANK YOU

Thank you for using KitchenLab Pro! This v0.1.0 release represents months of development, testing, and refinement. We're excited to bring professional kitchen planning tools to your browser.

**Feedback Welcome:** We value your feedback and bug reports as we continue to improve KitchenLab Pro.

---

**Release Version:** v0.1.0  
**Release Date:** TBD  
**Document Version:** 1.0 (Draft)  
**Last Updated:** February 15, 2026

---

## 📋 CHANGELOG FORMAT

For reference, future releases will use this changelog format:

### Added
- New features added

### Changed
- Changes to existing features

### Deprecated
- Features marked for removal

### Removed
- Features removed

### Fixed
- Bug fixes

### Security
- Security updates and fixes

---

**END OF RELEASE NOTES**
