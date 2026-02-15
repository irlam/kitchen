# Smoke Test Suite
## KitchenLab Pro v0.1.0 - Post-Deployment Verification

**Purpose:** Quick verification that deployment was successful  
**Time Required:** 5-10 minutes  
**Tester:** Release engineer or QA lead

---

## 🎯 OVERVIEW

This smoke test suite verifies critical functionality after cPanel deployment. All tests should pass before considering deployment successful.

**Test Environment:**
- URL: `https://yourdomain.com/` (or your cPanel domain)
- Browser: Chrome 90+, Firefox 88+, or Edge 90+
- Prerequisites: Application deployed per DEPLOY_CPANEL.md

---

## ✅ SMOKE TEST CHECKLIST

### Test 1: Application Loads

**Objective:** Verify application loads without errors

**Steps:**
1. Open browser to: `https://yourdomain.com/`
2. Wait for page to fully load (3-5 seconds)
3. Open browser console (F12 → Console tab)

**Expected Results:**
- ✅ Page displays "KitchenLab Pro" header
- ✅ Side panel visible with project fields
- ✅ 3D view area displayed
- ✅ No red errors in console
- ✅ No "Failed to resolve module specifier" error

**Pass Criteria:**
- Application loads within 10 seconds
- No JavaScript errors in console
- UI elements visible and styled correctly

**Screenshot Location:** `smoke-test-1-loaded.png`

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check browser console for specific error
- Verify all files uploaded correctly
- Check DEPLOY_CPANEL.md troubleshooting section

---

### Test 2: 3D Scene Renders

**Objective:** Verify Three.js loaded and 3D scene renders

**Steps:**
1. Look at main 3D view area (center of screen)
2. Verify 3D grid visible
3. Check browser console for Three.js
4. Type in console: `console.log(THREE)`

**Expected Results:**
- ✅ 3D grid floor visible (blue/gray grid)
- ✅ Room walls visible (if default room present)
- ✅ Console shows Three.js object (not undefined)
- ✅ No WebGL errors

**Pass Criteria:**
- 3D scene renders within 5 seconds
- Grid floor visible
- No rendering errors

**Console Output:**
```javascript
console.log(THREE);
// Should output: Object {REVISION: "137", ...}
```

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check browser supports WebGL (try chrome://gpu)
- Verify Three.js CDN accessible
- Check console for specific Three.js errors

---

### Test 3: Catalog Modal Opens

**Objective:** Verify catalog loads with items

**Steps:**
1. Click **"Add Item"** button (or similar catalog button)
2. Wait for modal to open
3. Scroll through catalog items
4. Check for item images/names

**Expected Results:**
- ✅ Modal opens within 2 seconds
- ✅ Item thumbnails visible
- ✅ Item names displayed
- ✅ Category tabs present (Floor, Wall, In-Wall)
- ✅ 200+ items available

**Pass Criteria:**
- Modal opens successfully
- At least 50 items visible
- Item images load (may be thumbnails or 3D previews)

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check models/ directory uploaded
- Verify 200+ .js files in models/
- Check console for 404 errors on model files

---

### Test 4: Add Item to Scene

**Objective:** Verify item can be added from catalog

**Steps:**
1. Open catalog modal
2. Select any item (e.g., "Base Cabinet 60cm")
3. Click **Add** or double-click item
4. Wait for item to appear in 3D view
5. Verify item visible in scene

**Expected Results:**
- ✅ Item appears in 3D view
- ✅ Item has 3D model (not just box)
- ✅ Item positioned near origin or cursor
- ✅ No console errors

**Pass Criteria:**
- Item successfully added
- 3D model renders correctly
- Item visible and properly textured

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check model file loaded (console network tab)
- Verify models/ directory permissions
- Try different item

---

### Test 5: 3D Dimensions Visible (CRITICAL)

**Objective:** Verify Phase 1B fix - 3D dimensions visible by default

**Steps:**
1. With item in scene (from Test 4)
2. Look at item in 3D view
3. **DO NOT SELECT ITEM** - just observe
4. Look for dimension labels on item

**Expected Results:**
- ✅ Dimension labels **VISIBLE WITHOUT SELECTION** ✅ (Phase 1B fix)
- ✅ Width-Height label visible on front face
- ✅ Width-Depth label visible on top face
- ✅ Labels show measurements (e.g., "60cm x 72cm")

**Pass Criteria:**
- 3D dimension labels visible by default
- Labels readable and positioned correctly
- Dimensions match item size

**CRITICAL:** This is the PRIMARY FIX from Phase 1B. If this fails, deployment should be rolled back.

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- **CRITICAL FAILURE** - Verify source code deployed correctly
- Check src/kitchenKreation.js line 12296: `canvasPlaneWH.visible = true`
- Check line 12654: hide logic commented out
- Consider rollback if fix not present

---

### Test 6: Move Item

**Objective:** Verify item drag functionality works

**Steps:**
1. Click and hold on item in 3D view
2. Drag mouse to new position
3. Release mouse button
4. Verify item moved to new location

**Expected Results:**
- ✅ Item follows mouse during drag
- ✅ Item releases at mouse position
- ✅ Dimension labels update with new position
- ✅ No errors during drag

**Pass Criteria:**
- Drag operation smooth
- Item repositions correctly
- Dimensions update in real-time

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check browser console for errors
- Try refreshing page and re-testing
- Verify no JavaScript errors blocking interaction

---

### Test 7: Resize Item

**Objective:** Verify item can be resized

**Steps:**
1. Select item (click on it)
2. Find properties panel (usually right side)
3. Locate width/height/depth controls
4. Change width value (e.g., 60 → 80)
5. Verify item updates in 3D view

**Expected Results:**
- ✅ Properties panel shows current dimensions
- ✅ Can edit width/height/depth values
- ✅ Item resizes in 3D view when value changed
- ✅ Dimension labels update to show new size

**Pass Criteria:**
- Resize operation works
- 3D model updates
- Dimension labels reflect new size

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Verify properties panel visible
- Check console for errors
- Try different item

---

### Test 8: Save Project

**Objective:** Verify server-side persistence works

**Steps:**
1. With item(s) in scene
2. Enter project name: "Smoke Test 1"
3. Click **Save** button
4. Wait for save confirmation
5. Check for success message

**Expected Results:**
- ✅ Save completes within 2 seconds
- ✅ Success message displayed (alert or toast)
- ✅ No errors in console
- ✅ No "database locked" errors

**Pass Criteria:**
- Save completes successfully
- Confirmation message shown
- No database errors

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check api/projects.php accessible
- Verify data/ directory exists and writable
- Check PHP error log
- Verify SQLite3 extension enabled
- See DEPLOY_CPANEL.md troubleshooting

---

### Test 9: Load Project

**Objective:** Verify saved project can be loaded

**Steps:**
1. Click **Load** button (or Open Project)
2. Wait for project list modal
3. Select "Smoke Test 1" project
4. Click **Load** or **Open**
5. Wait for project to load
6. Verify item(s) restored

**Expected Results:**
- ✅ Project list displays saved projects
- ✅ "Smoke Test 1" appears in list
- ✅ Project loads within 3 seconds
- ✅ Item(s) restored to correct positions
- ✅ Dimensions preserved
- ✅ Properties match saved values

**Pass Criteria:**
- Load completes successfully
- Scene matches saved state
- All items present

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check database file exists: data/projects.db
- Verify database permissions
- Check console for API errors
- Review PHP error log

---

### Test 10: Export PNG

**Objective:** Verify export functionality works

**Steps:**
1. With item(s) in scene
2. Find export button (usually "Export" or camera icon)
3. Select "Export PNG" or "Save Image"
4. Wait for export to complete
5. Verify PNG file downloads

**Expected Results:**
- ✅ Export completes within 5 seconds
- ✅ PNG file downloads to browser downloads folder
- ✅ PNG shows 3D scene with items
- ✅ No errors in console

**Pass Criteria:**
- Export completes successfully
- PNG file valid and openable
- Image quality acceptable

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check html2canvas loaded correctly
- Verify canvas export permissions
- Try different browser

---

### Test 11: Unit Conversion

**Objective:** Verify multi-unit support works

**Steps:**
1. Select item in scene
2. Find unit selector (usually in properties or settings)
3. Change from "cm" to "inches"
4. Observe dimension labels update
5. Change to "feet" (if available)
6. Verify conversion correct

**Expected Results:**
- ✅ Unit selector changes successfully
- ✅ Dimension labels update immediately
- ✅ Conversion mathematically correct
  - 60cm = 23.62 inches (approximately)
  - 60cm = 1'11" (approximately)
- ✅ No precision errors (no "59.99999" display)

**Pass Criteria:**
- Unit conversion works
- Math accurate
- Display clean (no floating point artifacts)

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Check dimension utility functions loaded
- Verify conversion logic present
- Check console for errors

---

### Test 12: Undo/Redo

**Objective:** Verify history stack works

**Steps:**
1. Move an item to new position (note position)
2. Click **Undo** button (or Ctrl+Z)
3. Verify item returns to previous position
4. Click **Redo** button (or Ctrl+Y)
5. Verify item returns to new position

**Expected Results:**
- ✅ Undo button functional
- ✅ Item restores to previous state
- ✅ Redo button functional
- ✅ Item restores to undone state
- ✅ Dimension labels update correctly

**Pass Criteria:**
- Undo/redo operations work
- State restored correctly
- No errors

**Actual Result:** _________

**Status:** [ ] PASS [ ] FAIL

**If Failed:**
- Verify undo/redo buttons present
- Check history stack implementation
- Try manual operation (move, resize) and undo

---

## 📊 SMOKE TEST SUMMARY

**Test Results:**

| Test # | Test Name | Status | Critical? |
|--------|-----------|--------|-----------|
| 1 | Application Loads | [ ] P [ ] F | ✅ YES |
| 2 | 3D Scene Renders | [ ] P [ ] F | ✅ YES |
| 3 | Catalog Opens | [ ] P [ ] F | ⚠️ HIGH |
| 4 | Add Item | [ ] P [ ] F | ⚠️ HIGH |
| 5 | **3D Dimensions Visible** | [ ] P [ ] F | 🔴 **CRITICAL** |
| 6 | Move Item | [ ] P [ ] F | ⚠️ HIGH |
| 7 | Resize Item | [ ] P [ ] F | MEDIUM |
| 8 | Save Project | [ ] P [ ] F | ⚠️ HIGH |
| 9 | Load Project | [ ] P [ ] F | ⚠️ HIGH |
| 10 | Export PNG | [ ] P [ ] F | MEDIUM |
| 11 | Unit Conversion | [ ] P [ ] F | MEDIUM |
| 12 | Undo/Redo | [ ] P [ ] F | MEDIUM |

**Pass Criteria for Deployment Approval:**
- **ALL CRITICAL tests MUST PASS** (Tests 1, 2, 5)
- **ALL HIGH tests MUST PASS** (Tests 3, 4, 6, 8, 9)
- **At least 75% of MEDIUM tests PASS** (Tests 7, 10, 11, 12)

**Overall Status:** [ ] ✅ PASS [ ] ❌ FAIL [ ] ⚠️ PARTIAL

**Pass Rate:** ____ / 12 tests (____%)

**Critical Failures:** ____ (must be 0 for approval)

**Recommendation:**
- [ ] **APPROVE DEPLOYMENT** - All critical tests passed
- [ ] **CONDITIONAL APPROVE** - Minor issues documented
- [ ] **REJECT DEPLOYMENT** - Critical failures, rollback required

---

## 🚨 CRITICAL FAILURE RESPONSE

**If Test 5 (3D Dimensions Visible) Fails:**

This is the PRIMARY FIX from Phase 1B. A failure means the core issue has regressed.

**Immediate Actions:**
1. **STOP DEPLOYMENT** - Do not proceed
2. **ROLLBACK** - Restore previous version if applicable
3. **INVESTIGATE:** Check source code
   ```javascript
   // Verify src/kitchenKreation.js contains:
   // Line 12296: canvasPlaneWH.visible = canvasPlaneWD.visible = true;
   // Line 12654: // this.canvasPlaneWH.visible = ... (commented)
   ```
4. **REBUILD:** If code correct, rebuild: `npm run build`
5. **REDEPLOY:** Upload correct dist/ files
6. **RETEST:** Run smoke tests again

**If Other Critical Tests Fail:**
- Investigate specific failure
- Check DEPLOY_CPANEL.md troubleshooting
- Review console errors
- Check server logs
- Consult KNOWN_LIMITATIONS.md

---

## 🔍 DETAILED VERIFICATION URLS

**For automated testing or manual verification:**

| Test | URL / Action | Expected |
|------|-------------|----------|
| Homepage | `https://yourdomain.com/` | 200 OK, HTML |
| API Endpoint | `https://yourdomain.com/api/projects.php` | JSON response |
| Three.js CDN | `https://unpkg.com/three@0.137.0/build/three.module.js` | JS file |
| CSS Bundle | `https://yourdomain.com/assets/index-LTNhhvGz.css` | CSS file |
| JS Bundle | `https://yourdomain.com/assets/index-DOvuaGHP.js` | JS file |

**Console Verification Commands:**

```javascript
// Verify Three.js loaded
console.log(THREE.REVISION);  // Should output: "137"

// Verify application initialized
console.log(window.kitchenApp);  // Should be defined

// Verify canvas present
console.log(document.querySelector('canvas'));  // Should return canvas element

// Check for errors
console.log(window.errors);  // Should be empty or undefined
```

---

## 📝 TEST EXECUTION LOG

**Tester Name:** _____________________  
**Test Date:** _____________________  
**Test Time:** _____________________ (UTC)  
**Browser:** _____________________  
**Browser Version:** _____________________  
**OS:** _____________________  
**Deployment URL:** _____________________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

**Issues Found:**
_____________________________________________
_____________________________________________
_____________________________________________

**Recommendations:**
_____________________________________________
_____________________________________________
_____________________________________________

**Sign-Off:**

**Tester Signature:** _____________________ **Date:** _____

**Release Engineer Approval:** _____________________ **Date:** _____

---

## 📸 SCREENSHOT CHECKLIST

Capture screenshots for documentation:

- [ ] Test 1: Application loaded (full page)
- [ ] Test 2: 3D scene rendering (grid visible)
- [ ] Test 5: **3D dimensions visible** (CRITICAL - close-up of labels)
- [ ] Test 8: Save confirmation message
- [ ] Test 9: Loaded project with items
- [ ] Browser console (showing no errors)

**Screenshot Naming:**
- `smoke-test-v0.1.0-YYYY-MM-DD-HH-MM.png`

---

**Document Version:** 1.0  
**Release:** v0.1.0  
**Last Updated:** February 15, 2026  
**Next Review:** v0.2.0 release
