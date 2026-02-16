# KNOWN LIMITATIONS
## KitchenLab Pro v0.1.0

**Release Date:** TBD  
**Document Version:** 1.1  
**Last Updated:** February 16, 2026

---

## 🎯 PURPOSE

This document lists non-blocking issues, limitations, and workarounds for KitchenLab Pro v0.1.0. These items are known and documented but do not prevent production deployment.

---

## 🔶 MODERATE PRIORITY LIMITATIONS

### 1. Build Warnings - Bundle Size ✅ PARTIALLY RESOLVED

**Category:** Build Process  
**Severity:** MODERATE  
**Impact:** Code quality concern, no functional impact

**Description:**
Build process produces a warning about bundle size.

**Details:**
```
(!) Some chunks are larger than 500 kB after minification.
dist/assets/index-BK5UErxl.js  1,010.84 kB │ gzip: 257.75 kB
```

**Root Cause:**
Large bundle size (1,010KB) - no code splitting implemented

**Impact:**
- Warning only - build completes successfully
- Large bundle may cause slower initial load on slow connections
- Gzipped size (257KB) is acceptable for most use cases

**Workaround:**
- None needed - warnings don't affect functionality
- For slow connections, consider enabling browser caching

**Fixed Items:**
- ✅ CSS syntax error (#3D-Floorplan) - RESOLVED by renaming to #floorplan-3d

**Planned Fix:**
- v0.2.0: Rename CSS ID to valid identifier (#floorplan-3d or #_3D-Floorplan)
- v0.3.0: Implement code splitting to reduce bundle size

---

### 2. Development-Time Security Vulnerabilities

**Category:** Security  
**Severity:** MODERATE  
**Impact:** Development environment only

**Description:**
NPM audit reports 2 moderate severity vulnerabilities in development dependencies.

**Details:**
```
esbuild <=0.24.2 (MODERATE)
  - Issue: Enables any website to send requests to dev server
  - GHSA: GHSA-67mh-4wv8-2f99
  - CVE: Not assigned
  - Severity: MODERATE (CVSS 5.3)

vite 0.11.0 - 6.1.6 (MODERATE)
  - Depends on vulnerable esbuild version
```

**Root Cause:**
Development dependencies (esbuild, vite) have known vulnerabilities affecting dev server.

**Impact:**
- **Development only** - does NOT affect production build
- Dev server could potentially be exploited if exposed to internet
- Production bundle built with these tools is NOT vulnerable
- No runtime security risk in deployed application

**Workaround:**
- Only run dev server on localhost
- Don't expose dev server (port 5173) to public internet
- Use production build for any public deployment

**Planned Fix:**
- v0.2.0: Update vite to v7.3.1+ (requires major version upgrade)
- May require code changes for vite v7 compatibility

**Security Assessment:**
✅ ACCEPTABLE FOR v0.1.0 RELEASE
- Vulnerabilities are dev-time only
- Production build is secure
- Clear mitigation strategy exists

---

### 3. No Auto-Snap During Drag ✅ RESOLVED

**Category:** User Experience
**Severity:** MODERATE
**Status:** ✅ RESOLVED in v0.1.0

**Description:**
Items don't automatically snap to grid or standard dimensions while dragging. User must manually click "Snap to Cabinet Size" button after placement.

**Resolution:**
Auto-snap during drag has been implemented. Items now automatically snap to standard cabinet dimensions (widths: 30, 45, 60, 80, 90, 100, 120 cm; heights: 72, 90, 210 cm; depths: 30, 60 cm) when within 5cm threshold during drag operations.

**Details:**
- Auto-snap toggle available in properties panel ("🎯 Auto-Snap While Editing")
- Snaps to nearest standard dimension during drag
- Visual feedback shows snapped dimensions
- Can be disabled for free-form placement

---

### 4. No Visual Collision Warnings ✅ RESOLVED

**Category:** User Experience
**Severity:** MODERATE
**Status:** ✅ RESOLVED in v0.1.0

**Description:**
Collision detection logic is implemented and tested, but no visual warnings shown in UI when items overlap.

**Resolution:**
Enhanced collision warnings have been implemented:
- Items glow bright red (emissive intensity 0.8) when collision detected
- Toast notification appears: "⚠️ Collision Detected! Items are overlapping"
- Auto-reverts to last valid position on release if collision persists
- Collision warning event dispatched for UI integration

**Details:**
- 14 collision detection tests pass
- Bounding box intersection logic functional
- Visual feedback with red highlight
- UI toast notification (3 second auto-dismiss)

---

### 5. No Catalog Search UI

**Category:** User Experience  
**Severity:** MODERATE  
**Impact:** Poor usability with large catalog

**Description:**
Catalog contains 200+ items but has no search box or filter UI. Search logic is implemented and tested, but not exposed to users.

**Details:**
- Search/filter logic exists and works (22 tests pass)
- filterByName() supports case-insensitive partial matching
- Category filter logic implemented
- No UI controls in catalog modal

**Impact:**
- Users must scroll through all 200+ items to find specific item
- Time-consuming to locate specific cabinet or appliance
- Reduced productivity
- Poor user experience

**Workaround:**
1. Use browser Find (Ctrl+F) on catalog modal
2. Remember approximate position of frequently used items
3. Use category tabs (Floor Items, Wall Items, In-Wall Items) to narrow down

**Planned Fix:**
- Phase 4: Add search input box to catalog modal
- Add real-time filtering as user types
- Add category filter buttons
- Add "Recently Used" section for quick access

---

## 🔵 LOW PRIORITY LIMITATIONS

### 6. No Keyboard Shortcuts

**Category:** User Experience  
**Severity:** LOW  
**Impact:** Reduced productivity for power users

**Description:**
Only Delete/Backspace keys are implemented. Common shortcuts missing.

**Missing Shortcuts:**
- Ctrl+Z / Cmd+Z: Undo (must use button)
- Ctrl+Y / Cmd+Y: Redo (must use button)
- Ctrl+S / Cmd+S: Save (must use button)
- Ctrl+C / Cmd+C: Copy item (not available)
- Ctrl+V / Cmd+V: Paste item (not available)
- Arrow keys: Move item (not available)
- R: Rotate (not available)
- G: Toggle grid (not available)

**Workaround:**
Use mouse to click buttons in UI.

**Planned Fix:**
v0.4.0 - Implement comprehensive keyboard shortcuts

---

### 7. No Room Dimension Display

**Category:** Missing Feature  
**Severity:** LOW  
**Impact:** Users can't see total room size

**Description:**
Individual wall lengths shown, but no total room width/height display.

**Workaround:**
Manually add up wall lengths, or check in 2D floorplan view.

**Planned Fix:**
v0.4.0 - Add room dimension summary panel

---

### 8. No Dimension Visibility Toggle

**Category:** Missing Feature  
**Severity:** LOW  
**Impact:** Can't hide dimensions for cleaner view

**Description:**
Dimensions are always visible. No UI control to toggle on/off.

**Note:**
3D dimensions ARE visible by default after Phase 1B fix (previously hidden).

**Workaround:**
None - dimensions always shown.

**Planned Fix:**
v0.4.0 - Add "Show/Hide Dimensions" toggle button

---

### 9. No Door/Window Dimensions

**Category:** Missing Feature  
**Severity:** LOW  
**Impact:** Openings not dimensioned

**Description:**
Doors and windows don't show dimension labels.

**Workaround:**
Manually measure or estimate opening sizes.

**Planned Fix:**
v0.5.0 - Add dimension labels to openings

---

### 10. Large Monolithic Source Files

**Category:** Code Quality  
**Severity:** LOW  
**Impact:** Development/maintenance difficulty

**Description:**
Main engine file (kitchenKreation.js) is 18,868 lines.

**Impact:**
- Slower to load in editor
- Harder to navigate
- Merge conflicts more likely
- Technical debt accumulation

**Workaround:**
Use IDE code folding and search features.

**Planned Fix:**
v0.6.0 - Refactor into smaller modules

---

### 11. No Loading States

**Category:** User Experience  
**Severity:** LOW  
**Impact:** No feedback during async operations

**Description:**
No spinners or progress indicators during save/load operations.

**Workaround:**
Wait for operation to complete (usually < 1 second).

**Planned Fix:**
v0.4.0 - Add loading spinners

---

### 12. CORS Wide Open in API

**Category:** Security  
**Severity:** LOW  
**Impact:** Production security concern

**Description:**
API endpoints use `Access-Control-Allow-Origin: *`

**Details:**
```php
// api/projects.php line 3
header("Access-Control-Allow-Origin: *");
```

**Impact:**
- Any website can call API endpoints
- No origin restriction
- Potential for abuse

**Workaround:**
Restrict at web server level (Apache/nginx) or API gateway.

**Planned Fix:**
v0.2.0 - Restrict CORS to specific domain(s)

---

### 13. No Project Name Validation

**Category:** Code Quality  
**Severity:** LOW  
**Impact:** Can save with empty name

**Description:**
Save dialog allows empty project names.

**Impact:**
- Database entries with empty names
- Hard to identify projects later
- Potential database errors

**Workaround:**
Always enter a project name before saving.

**Planned Fix:**
v0.3.0 - Add validation: required field, min/max length

---

### 14. Dead Code Present

**Category:** Code Quality  
**Severity:** LOW  
**Impact:** Code maintainability

**Description:**
Unused localStorage functions in app.js (line 151-166).

**Details:**
Feature was removed in favor of server-side persistence, but code remains.

**Impact:**
- Code clutter
- Potential confusion for new developers
- Minimal (few KB)

**Workaround:**
None needed - doesn't affect functionality.

**Planned Fix:**
v0.3.0 - Remove dead code

---

## 🔄 BROWSER COMPATIBILITY

**Tested:**
- Chrome/Edge (Chromium) 90+: ✅ Full support
- Firefox 88+: ✅ Full support  
- Safari 14+: ⚠️ Untested

**Known Issues:**
- Safari may have WebGL differences (untested)
- IE11 not supported (ES6+ code)

**Recommendation:**
Use Chrome, Edge, or Firefox for best experience.

---

## 📱 DEVICE COMPATIBILITY

**Desktop:**
- Windows: ✅ Tested and working
- macOS: ⚠️ Expected to work (untested)
- Linux: ⚠️ Expected to work (untested)

**Mobile:**
- Touch controls: ⚠️ Untested
- Small screens: ⚠️ UI may not be optimized
- Tablets: ⚠️ Should work but untested

**Recommendation:**
Desktop browser with mouse recommended for best experience.

---

## 📊 PERFORMANCE NOTES

**Bundle Size:**
- Uncompressed: 987KB JavaScript
- Gzipped: 257KB JavaScript
- CSS: 18KB

**Load Time (Estimated):**
- Fast connection (10 Mbps): < 2 seconds
- Medium connection (1 Mbps): ~ 10 seconds
- Slow connection (256 kbps): ~ 30 seconds

**Memory Usage:**
- Initial: ~100MB
- With 20 items: ~150MB
- With 50 items: ~200MB

**Recommended Specs:**
- RAM: 4GB minimum, 8GB recommended
- GPU: WebGL 2.0 capable
- Connection: 1 Mbps or faster

---

## 🔧 WORKAROUND SUMMARY

For quick reference, here are the most important workarounds:

1. **Manual Snap:** Click "Snap to Cabinet Size" button after placing items
2. **Check Overlaps:** Visually inspect in 2D and 3D views
3. **Find Items:** Use browser Ctrl+F on catalog modal
4. **Security:** Only run dev server on localhost
5. **Slow Load:** Enable browser caching, use fast connection

---

## 📅 RELEASE ROADMAP

**v0.2.0 (Target: Q2 2026)**
- Update vite/esbuild (security)
- Restrict CORS policy
- Fix CSS ID warning

**v0.3.0 (Target: Q3 2026)**
- Remove dead code
- Add project name validation
- Code quality improvements

**v0.4.0 (Target: Q4 2026)**
- Auto-snap during drag
- Visual collision warnings
- Catalog search UI
- Keyboard shortcuts
- Dimension visibility toggle

**v0.5.0+ (Future)**
- Door/window dimensions
- Code modularization
- Performance optimizations
- Mobile optimization

---

## ℹ️ SUPPORT

**Reporting Issues:**
If you encounter a bug not listed here, please report:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS version
- Screenshots if applicable

**Questions:**
For questions about known limitations or workarounds, consult this document first.

---

**Document Version:** 1.0  
**Release:** v0.1.0  
**Last Updated:** February 15, 2026  
**Status:** Living document - will be updated as issues are discovered
