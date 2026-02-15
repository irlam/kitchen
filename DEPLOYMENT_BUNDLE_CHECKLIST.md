# Deployment Bundle Checklist
## KitchenLab Pro v0.1.0 - cPanel Production Deployment

**Version:** 0.1.0  
**Release Date:** February 15, 2026  
**Document Purpose:** Complete deployment package specification

---

## 📦 DEPLOYMENT PACKAGE CONTENTS

### From `dist/` Directory

After running `npm run build`, the `dist/` directory contains production-ready files.

**Total Package Size:** ~50-100 MB  
**Compressed:** ~30-50 MB (zip/tar.gz)

---

## 📂 REQUIRED FILES & FOLDERS

### 1. HTML Entry Points

```
dist/index.html                    → public_html/index.html
dist/index.static.html             → public_html/index.static.html
```

**Purpose:**
- `index.html` - Main application entry point (uses Vite dev features)
- `index.static.html` - Static fallback (no dev server dependencies)

**Size:** ~11-12 KB each

**Critical:** Both files include updated importmap with `three/` path fix

---

### 2. JavaScript & CSS Bundles

```
dist/assets/index-DOvuaGHP.js      → public_html/assets/index-DOvuaGHP.js
dist/assets/index-LTNhhvGz.css     → public_html/assets/index-LTNhhvGz.css
```

**Purpose:**
- Main application bundle (all JS compiled and minified)
- Application styles (all CSS compiled and minified)

**Sizes:**
- JS: 1,008.79 KB uncompressed (257.06 KB gzipped)
- CSS: 18.01 KB uncompressed (4.18 KB gzipped)

**Note:** Hash in filename (`DOvuaGHP`, `LTNhhvGz`) changes with each build for cache busting

---

### 3. API Backend (PHP)

```
dist/api/                          → public_html/api/
  └── projects.php                 → public_html/api/projects.php
```

**Purpose:**
- RESTful API for save/load functionality
- SQLite database operations
- CRUD operations for projects

**Size:** ~10-20 KB

**Requirements:**
- PHP 7.4+
- PDO extension
- SQLite3 extension
- Write permissions on data/ directory

---

### 4. 3D Models

```
dist/models/                       → public_html/models/
  └── [200+ .js files]             → public_html/models/
```

**Purpose:**
- 3D models for catalog items
- Cabinets, appliances, fixtures
- Loaded dynamically when items added to scene

**Count:** 200+ files  
**Total Size:** ~40-60 MB  
**Format:** .js (Three.js compatible)

**Examples:**
- `base-cabinet-60.js`
- `wall-cabinet-80.js`
- `refrigerator.js`
- `sink-single.js`

---

### 5. CSS Stylesheets

```
dist/css/                          → public_html/css/
  └── app.css                      → public_html/css/app.css
```

**Purpose:**
- Application styles (unbundled version)
- Used by static HTML if needed

**Size:** ~20-30 KB

**Note:** Main bundle uses `dist/assets/*.css` which is compiled version

---

### 6. Room Templates

```
dist/rooms/                        → public_html/rooms/
  └── [room template files]        → public_html/rooms/
```

**Purpose:**
- Pre-defined room layouts
- Template configurations
- Default room shapes

**Size:** ~1-5 MB

---

### 7. SQL Schema

```
dist/sql/                          → public_html/sql/
  └── [database schema files]      → public_html/sql/
```

**Purpose:**
- SQLite database schema
- Initial setup scripts
- Migration scripts (if applicable)

**Size:** ~10-50 KB

**Note:** Database created automatically on first save operation

---

### 8. License File

```
dist/LICENSE.txt                   → public_html/LICENSE.txt
```

**Purpose:** Software license terms  
**Size:** ~1 KB

---

## 🔧 ADDITIONAL REQUIRED SETUP

### 1. Database Directory

**Create manually (not in dist/):**

```bash
mkdir public_html/data
chmod 755 public_html/data
```

**Purpose:**
- SQLite database storage
- Projects saved to: `data/projects.db`

**Permissions:**
- Directory: 755 (rwxr-xr-x)
- Database file: 666 (rw-rw-rw-) - created on first save

---

### 2. .htaccess Configuration

**Create in `public_html/.htaccess`:**

```apache
# Force HTTPS (recommended for production)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType model/gltf-binary "access plus 1 year"
</IfModule>

# Protect SQLite database
<FilesMatch "\.(db|sqlite|sqlite3)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Allow PHP in api/ directory
<Directory "api">
  <Files "*.php">
    Allow from all
  </Files>
</Directory>
```

---

## ⚙️ ENVIRONMENT / CONFIG VALUES

### cPanel Settings

| Setting | Required Value | Verification Method |
|---------|---------------|---------------------|
| **PHP Version** | 7.4 or higher | cPanel → Select PHP Version |
| **PDO Extension** | Enabled | phpinfo() → PDO section |
| **SQLite3 Extension** | Enabled | phpinfo() → SQLite3 section |
| **allow_url_fopen** | On | phpinfo() → Core section |
| **max_execution_time** | 30+ seconds | phpinfo() → Core section |
| **memory_limit** | 128M+ | phpinfo() → Core section |
| **upload_max_filesize** | 10M+ | phpinfo() → Core section |

### PHP Configuration

**Verify via phpinfo():**

```php
<?php phpinfo(); ?>
```

Upload to `public_html/phpinfo.php`, access via browser, then delete.

### CORS Configuration

**Edit `api/projects.php` line 3:**

```php
// PRODUCTION (replace with your actual domain)
header("Access-Control-Allow-Origin: https://yourdomain.com");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
```

**For subdomain:**
```php
header("Access-Control-Allow-Origin: https://kitchen.yourdomain.com");
```

### Database Path Configuration

**Verify in `api/projects.php`:**

```php
// Line ~10-15
$db = new PDO('sqlite:../data/projects.db');
$db->setAttribute(PDO::ATTR_TIMEOUT, 10);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
```

**Adjust if needed** based on cPanel directory structure.

---

## ✅ POST-DEPLOY SMOKE TEST CHECKLIST

### Quick Verification (2 minutes)

**1. Application Loads**
- [ ] Open: `https://yourdomain.com/`
- [ ] Page displays "KitchenLab Pro" header
- [ ] No console errors (F12)
- [ ] No "Failed to resolve module specifier" error ✅

**2. 3D Scene Renders**
- [ ] 3D view shows grid floor
- [ ] No WebGL errors
- [ ] Console shows `THREE` object defined

**3. Add Item**
- [ ] Open catalog modal
- [ ] Select any item
- [ ] Item appears in 3D scene

**4. 3D Dimensions Visible (CRITICAL)**
- [ ] Dimension labels visible WITHOUT selecting item ✅
- [ ] Labels show width, height, depth measurements
- [ ] **This is the Phase 1B fix - MUST PASS**

**5. Save Project**
- [ ] Enter project name
- [ ] Click Save button
- [ ] Success message appears
- [ ] No database errors

**6. Load Project**
- [ ] Click Load/Open
- [ ] Project list shows saved project
- [ ] Load completes successfully
- [ ] Items restored correctly

**Pass Criteria:** ALL 6 tests must pass

**If Test 4 fails:** CRITICAL - Rollback deployment immediately

---

## 📋 FULL SMOKE TEST PROCEDURE

For comprehensive testing, see: **docs/SMOKE_TEST.md**

**Test Coverage:**
- 12 comprehensive tests
- ~10 minutes to complete
- Covers all critical functionality
- Screenshots for documentation

**Required Pass Rate:**
- All CRITICAL tests: 100%
- All HIGH tests: 100%
- MEDIUM tests: 75%+

---

## 📊 DEPLOYMENT VERIFICATION URLS

### Verify Files Accessible

| Resource | URL | Expected Response |
|----------|-----|-------------------|
| Homepage | `https://yourdomain.com/` | 200 OK, HTML |
| Static | `https://yourdomain.com/index.static.html` | 200 OK, HTML |
| JS Bundle | `https://yourdomain.com/assets/index-DOvuaGHP.js` | 200 OK, JS file |
| CSS Bundle | `https://yourdomain.com/assets/index-LTNhhvGz.css` | 200 OK, CSS file |
| API | `https://yourdomain.com/api/projects.php` | 200 OK, JSON |
| Model (test) | `https://yourdomain.com/models/base-cabinet-60.js` | 200 OK, JS file |

### Console Verification

**Open browser console (F12), run:**

```javascript
// Verify Three.js loaded
console.log(THREE.REVISION);  
// Expected: "137"

// Verify importmap fix
import('three/examples/jsm/utils/BufferGeometryUtils.js')
  .then(() => console.log('✅ Import successful'))
  .catch(err => console.error('❌ Import failed:', err));
// Expected: ✅ Import successful

// Verify canvas present
console.log(!!document.querySelector('canvas'));
// Expected: true
```

---

## 🚨 CRITICAL SUCCESS CRITERIA

### MUST PASS for Production Deployment

1. **✅ Application loads without errors**
   - No 404 errors on assets
   - No console JavaScript errors
   - No "Failed to resolve module specifier" error

2. **✅ 3D dimensions visible by default** (Phase 1B fix)
   - Labels visible WITHOUT item selection
   - This is PRIMARY FIX - regression = rollback

3. **✅ Save/Load functionality works**
   - Can save projects to database
   - Can load saved projects
   - Data persists correctly

4. **✅ Security clean**
   - 0 production vulnerabilities
   - CORS configured properly
   - Database not web-accessible

5. **✅ Performance acceptable**
   - Page loads < 10 seconds on normal connection
   - 3D scene renders smoothly
   - No memory leaks observed

---

## 📁 DEPLOYMENT PACKAGE STRUCTURE

### Visual Directory Tree

```
kitchen-v0.1.0-dist.zip/
├── index.html (11 KB) ⚠️ UPDATED with importmap fix
├── index.static.html (9 KB) ⚠️ UPDATED with importmap fix
├── LICENSE.txt (1 KB)
├── assets/
│   ├── index-DOvuaGHP.js (1 MB, 257 KB gzipped)
│   └── index-LTNhhvGz.css (18 KB, 4 KB gzipped)
├── api/
│   └── projects.php (15 KB) ⚙️ Configure CORS
├── models/
│   ├── base-cabinet-30.js
│   ├── base-cabinet-45.js
│   ├── base-cabinet-60.js
│   └── [197+ more models...]
├── css/
│   └── app.css (25 KB)
├── rooms/
│   └── [room templates]
└── sql/
    └── [database schema]

ADDITIONAL MANUAL SETUP:
├── data/ (create manually, chmod 755)
│   └── projects.db (created on first save)
└── .htaccess (create manually, see template above)
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

**Build Verification:**
- [ ] `npm install` completed successfully
- [ ] `npm test` - 141/141 tests passing
- [ ] `npm run build` - Build succeeded (2.5s)
- [ ] `npm audit --omit=dev` - 0 vulnerabilities
- [ ] `dist/` directory contains all required files

**Documentation:**
- [ ] DEPLOY_CPANEL.md reviewed
- [ ] SMOKE_TEST.md prepared
- [ ] VERSIONING.md reviewed
- [ ] This checklist reviewed

**Preparation:**
- [ ] cPanel access confirmed
- [ ] PHP 7.4+ verified
- [ ] SQLite3 extension verified
- [ ] Backup of existing site (if applicable)
- [ ] Domain/subdomain configured
- [ ] SSL certificate installed

---

## 📋 POST-DEPLOYMENT CHECKLIST

**Immediate (< 5 minutes):**
- [ ] All files uploaded successfully
- [ ] File permissions set correctly
- [ ] `data/` directory created
- [ ] `.htaccess` configured
- [ ] CORS updated in `api/projects.php`

**Smoke Tests (10 minutes):**
- [ ] Application loads
- [ ] 3D scene renders
- [ ] Catalog opens
- [ ] Add item works
- [ ] **3D dimensions visible** ✅ CRITICAL
- [ ] Move item works
- [ ] Save project works
- [ ] Load project works

**Security (5 minutes):**
- [ ] HTTPS enforced
- [ ] CORS restricted to domain
- [ ] Database file protected
- [ ] No sensitive data exposed

**Performance (5 minutes):**
- [ ] Page load time acceptable
- [ ] No console errors
- [ ] Memory usage normal
- [ ] 3D rendering smooth

---

## 🎯 DEPLOYMENT SUCCESS CRITERIA

**Definition of Done:**

✅ **DEPLOYMENT SUCCESSFUL** when:
1. All files uploaded and accessible
2. All smoke tests passing (100% critical, 100% high, 75%+ medium)
3. No console errors
4. 3D dimensions visible by default (Phase 1B fix confirmed)
5. Save/load functionality working
6. Security configured properly
7. Performance acceptable

❌ **DEPLOYMENT FAILED** if:
1. Critical smoke tests fail
2. Phase 1B fix (3D dimensions) not working
3. Console shows import errors
4. Save/load broken
5. Security vulnerabilities present

**On Failure:** Execute rollback procedure (see DEPLOY_CPANEL.md)

---

## 📞 SUPPORT & REFERENCES

**Documentation:**
- Deployment: `docs/DEPLOY_CPANEL.md`
- Testing: `docs/SMOKE_TEST.md`
- Versioning: `docs/VERSIONING.md`
- Issues: `KNOWN_LIMITATIONS.md`
- Release notes: `RELEASE_NOTES_DRAFT.md`

**Verification Commands:**
```bash
# Check deployed files
curl -I https://yourdomain.com/
curl -I https://yourdomain.com/api/projects.php

# Test Three.js CDN
curl -I https://unpkg.com/three@0.137.0/build/three.module.js

# Verify gzip enabled
curl -H "Accept-Encoding: gzip" -I https://yourdomain.com/assets/index-DOvuaGHP.js
```

---

**Document Version:** 1.0  
**Release:** v0.1.0  
**Last Updated:** February 15, 2026  
**Package Hash:** `cb4f429` (git commit)

**Deployment Bundle:** `kitchen-v0.1.0-dist.zip`  
**Checksum (SHA256):** [Generate after creating package]
