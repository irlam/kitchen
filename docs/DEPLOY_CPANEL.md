# cPanel Deployment Guide
## KitchenLab Pro v0.1.0

**Target Environment:** cPanel Shared Hosting  
**Document Version:** 1.0  
**Last Updated:** February 15, 2026

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before starting deployment, ensure you have:

- [ ] cPanel login credentials
- [ ] FTP/SFTP access or File Manager access
- [ ] PHP 7.4+ enabled on hosting account
- [ ] SQLite3 enabled (check via PHP Info)
- [ ] Domain/subdomain configured
- [ ] SSL certificate installed (recommended)
- [ ] Backup of existing site (if updating)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Build Production Bundle

On your local development machine:

```bash
# Navigate to project directory
cd /path/to/kitchen

# Install dependencies (if not already done)
npm install

# Run production build
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected Output:**
- `dist/index.html` (main entry point)
- `dist/index.static.html` (fallback)
- `dist/assets/` (bundled JS and CSS)
- `dist/api/` (PHP backend files)
- `dist/models/` (3D models)
- `dist/css/`, `dist/rooms/`, `dist/sql/`

### Step 2: Prepare Deployment Package

Create deployment package with these files/folders from `dist/`:

**Required Files (Root Level):**
```
dist/index.html               → public_html/index.html
dist/index.static.html        → public_html/index.static.html
dist/LICENSE.txt              → public_html/LICENSE.txt
```

**Required Directories:**
```
dist/assets/                  → public_html/assets/
dist/api/                     → public_html/api/
dist/models/                  → public_html/models/
dist/css/                     → public_html/css/
dist/rooms/                   → public_html/rooms/
dist/sql/                     → public_html/sql/
```

**Total Upload Size:** ~50-100MB (primarily 3D models)

### Step 3: Upload Files to cPanel

**Option A: File Manager (Recommended for beginners)**

1. Log into cPanel
2. Navigate to **File Manager**
3. Go to `public_html/` (or your subdomain directory)
4. Click **Upload** button
5. Upload all files from `dist/` maintaining directory structure
6. If prompted, select **Overwrite existing files**

**Option B: FTP/SFTP (Recommended for faster upload)**

```bash
# Using FileZilla, WinSCP, or command-line FTP
# Connect to your hosting account
# Navigate to public_html/ on remote
# Upload all dist/* contents to public_html/
```

**Option C: Command Line (SSH access required)**

```bash
# Compress dist folder locally
tar -czf kitchen-v0.1.0.tar.gz -C dist .

# Upload to server via SCP
scp kitchen-v0.1.0.tar.gz user@yourhost.com:~/

# SSH into server
ssh user@yourhost.com

# Extract to public_html
cd public_html
tar -xzf ~/kitchen-v0.1.0.tar.gz
```

### Step 4: Configure PHP Environment

**4.1 Verify PHP Version**

1. In cPanel, go to **Select PHP Version** or **MultiPHP Manager**
2. Ensure PHP **7.4 or higher** is selected
3. Verify these extensions are enabled:
   - ✅ PDO
   - ✅ SQLite3
   - ✅ JSON

**4.2 Create SQLite Database Directory**

Create `data/` directory with write permissions:

```bash
# Via SSH or cPanel Terminal
cd public_html
mkdir -p data
chmod 755 data
```

**4.3 Set File Permissions**

```bash
# Make API files executable (if needed)
chmod 644 api/*.php

# Ensure SQLite data directory is writable
chmod 755 data/

# Verify api/projects.php is readable
ls -l api/projects.php
```

### Step 5: Configure Database Path

The application expects SQLite database at: `data/projects.db`

**Verify in `api/projects.php`:**
```php
// Should point to writable directory
$db = new PDO('sqlite:../data/projects.db');
```

**If path needs adjustment:**
1. Edit `api/projects.php`
2. Update database path to match your hosting structure
3. Ensure directory exists and is writable

### Step 6: Configure CORS (Optional but Recommended)

**Edit `api/projects.php` line 3:**

```php
// DEVELOPMENT (allow all origins)
header("Access-Control-Allow-Origin: *");

// PRODUCTION (restrict to your domain)
header("Access-Control-Allow-Origin: https://yourdomain.com");
```

**Recommended for production:**
```php
header("Access-Control-Allow-Origin: https://yourdomain.com");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
```

### Step 7: Verify Deployment

**7.1 Check File Structure**

Verify all files uploaded correctly:

```
public_html/
├── index.html
├── index.static.html
├── LICENSE.txt
├── assets/
│   ├── index-DOvuaGHP.js
│   └── index-LTNhhvGz.css
├── api/
│   └── projects.php
├── models/
│   └── [200+ .js files]
├── css/
│   └── app.css
├── rooms/
│   └── [room files]
├── sql/
│   └── [sql files]
└── data/
    └── projects.db (will be created on first save)
```

**7.2 Test Application Access**

1. Open browser to: `https://yourdomain.com/`
2. Verify application loads without errors
3. Open browser console (F12) - should see no errors
4. Verify no "Failed to resolve module specifier" errors

**7.3 Run Post-Deployment Smoke Tests**

See **SMOKE_TEST.md** for complete testing procedure.

---

## 🔧 ENVIRONMENT CONFIGURATION

### Required cPanel Settings

| Setting | Value | Verification |
|---------|-------|--------------|
| PHP Version | 7.4+ | cPanel → Select PHP Version |
| PDO Extension | Enabled | PHP Info → PDO section |
| SQLite3 Extension | Enabled | PHP Info → SQLite3 section |
| `allow_url_fopen` | On | PHP Info → Core section |
| `max_execution_time` | 30+ seconds | PHP Info → Core section |
| `memory_limit` | 128M+ | PHP Info → Core section |

### Optional Performance Settings

**Enable Output Compression:**
```apache
# Add to .htaccess in public_html/
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>
```

**Enable Browser Caching:**
```apache
# Add to .htaccess
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType model/gltf-binary "access plus 1 year"
</IfModule>
```

**Enable GZIP Compression (if not already enabled):**
```apache
# Add to .htaccess
<IfModule mod_gzip.c>
  mod_gzip_on Yes
  mod_gzip_dechunk Yes
  mod_gzip_item_include file \.(html?|txt|css|js|php)$
</IfModule>
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

Run through smoke test checklist (see **SMOKE_TEST.md**):

1. **Application Loads:** Homepage displays correctly
2. **No Console Errors:** Browser console clean
3. **3D View:** Three.js loads, 3D scene renders
4. **Catalog:** Modal opens, items load
5. **Add Item:** Can add item from catalog
6. **Move Item:** Can drag item in 3D view
7. **Save Project:** Can save to database
8. **Load Project:** Can load saved project
9. **3D Dimensions:** Labels visible by default ✅
10. **Export:** PNG export works

**If all checks pass:** Deployment successful ✅

**If any check fails:** See Troubleshooting section below

---

## 🔍 TROUBLESHOOTING

### Issue: "Failed to resolve module specifier" Error

**Symptom:** Console error about three/examples/jsm/utils/BufferGeometryUtils.js

**Cause:** Importmap missing `three/` path mapping

**Solution:** 
```html
<!-- Verify index.html contains this importmap entry -->
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.137.0/build/three.module.js",
    "three/": "https://unpkg.com/three@0.137.0/",
    "html2canvas": "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js"
  }
}
</script>
```

### Issue: Application Loads But 3D View Empty

**Possible Causes:**
1. Three.js failed to load from CDN
2. WebGL not supported in browser
3. JavaScript errors preventing initialization

**Diagnostic Steps:**
```javascript
// Open browser console and check:
console.log(THREE);  // Should show Three.js library
console.log(window.WebGLRenderingContext);  // Should be defined
```

**Solutions:**
- Check browser supports WebGL (try chrome://gpu in Chrome)
- Verify Three.js CDN accessible (test https://unpkg.com/three@0.137.0/)
- Check console for specific error messages

### Issue: Save/Load Doesn't Work

**Symptom:** Clicking Save does nothing or shows error

**Possible Causes:**
1. SQLite database not writable
2. API endpoint not accessible
3. CORS blocking requests
4. PHP PDO not installed

**Diagnostic Steps:**
```bash
# Check database directory permissions
ls -la data/

# Test API endpoint directly
curl -X GET https://yourdomain.com/api/projects.php

# Check PHP error log
tail -f /path/to/php_error.log
```

**Solutions:**
```bash
# Fix permissions
chmod 755 data/
chmod 666 data/projects.db  # if it exists

# Test PHP extensions
php -m | grep -i pdo
php -m | grep -i sqlite
```

### Issue: Items Not Loading from Catalog

**Symptom:** Catalog modal empty or shows no items

**Possible Causes:**
1. JavaScript files not loading
2. Models directory not uploaded
3. CORS blocking model loading

**Solutions:**
- Verify `models/` directory uploaded (200+ .js files)
- Check browser console for 404 errors
- Verify file permissions on models/ (should be 644)

### Issue: WebSocket Error in Console

**Error:** `WebSocket connection to 'wss://kitchen.chrisirlam.com/ws/ws' failed`

**Cause:** Development-time hot reload trying to connect

**Impact:** **None** - This is a harmless dev server artifact, ignore in production

**Solution:** Can be safely ignored, or remove reload.js reference if present

### Issue: Slow Load Times

**Symptoms:** Application takes 30+ seconds to load

**Causes:**
1. Large bundle size (987KB uncompressed)
2. 200+ model files loading
3. No compression enabled
4. Slow hosting server

**Solutions:**
- Enable GZIP compression (see .htaccess section above)
- Enable browser caching (see .htaccess section above)
- Consider CDN for static assets
- Verify hosting server has adequate resources

### Issue: Database Locked Error

**Error:** "Database is locked" when saving

**Cause:** SQLite concurrency limitation

**Solutions:**
```php
// In api/projects.php, add timeout
$db = new PDO('sqlite:../data/projects.db');
$db->setAttribute(PDO::ATTR_TIMEOUT, 10);
```

### Issue: 403 Forbidden on API Endpoints

**Cause:** .htaccess blocking PHP execution

**Solution:**
```apache
# Ensure .htaccess allows PHP in api/ directory
<Directory "api">
  <Files "*.php">
    Allow from all
  </Files>
</Directory>
```

---

## 🔄 ROLLBACK PROCEDURE

If deployment fails or causes issues:

### Quick Rollback (Restore Previous Version)

**If you have backup:**
```bash
# Via cPanel File Manager
1. Delete current public_html/ contents
2. Restore from backup (cPanel → Backup → Restore)
3. Verify previous version working

# Via SSH
cd public_html
rm -rf *
tar -xzf ~/backup-YYYY-MM-DD.tar.gz
```

### Selective Rollback (Keep Database)

```bash
# Preserve database, rollback code only
cd public_html
mkdir temp_backup
mv data/ temp_backup/
# Delete all other files/folders
# Restore previous version
# Move database back
mv temp_backup/data/ .
```

---

## 🔐 SECURITY CONSIDERATIONS

### Production Security Checklist

- [ ] **CORS Restricted:** Update `api/projects.php` to allow only your domain
- [ ] **SSL Enabled:** Force HTTPS via .htaccess
- [ ] **Database Secure:** SQLite file not in web-accessible directory
- [ ] **Error Reporting Off:** PHP `display_errors = Off` in production
- [ ] **File Permissions:** Minimize write permissions
- [ ] **Regular Backups:** Automated daily backups enabled

### Force HTTPS

```apache
# Add to .htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Protect SQLite Database

```apache
# Add to .htaccess
<Files "*.db">
  Order allow,deny
  Deny from all
</Files>
```

---

## 📞 SUPPORT

**Deployment Issues:**
- Check cPanel error logs: cPanel → Errors
- Check PHP error log: /path/to/error_log
- Review browser console errors (F12)
- Refer to KNOWN_LIMITATIONS.md for documented issues

**Known Working Environments:**
- cPanel 11.92+
- PHP 7.4, 8.0, 8.1
- Apache 2.4+
- Modern browsers (Chrome 90+, Firefox 88+, Edge 90+)

---

## 📝 DEPLOYMENT CHECKLIST SUMMARY

**Pre-Deployment:**
- [ ] Build completed: `npm run build`
- [ ] Tests passed: `npm test`
- [ ] Security audit clean: `npm audit --omit=dev`
- [ ] Backup existing site

**Deployment:**
- [ ] Files uploaded to public_html/
- [ ] PHP 7.4+ enabled
- [ ] SQLite3 enabled
- [ ] Database directory created with permissions
- [ ] CORS configured for production domain

**Post-Deployment:**
- [ ] Application loads without errors
- [ ] Smoke tests passed (see SMOKE_TEST.md)
- [ ] Save/load functionality working
- [ ] 3D dimensions visible
- [ ] Performance acceptable

**Security:**
- [ ] HTTPS enabled
- [ ] CORS restricted
- [ ] Database protected
- [ ] Backups configured

---

**Document Version:** 1.0  
**Release:** v0.1.0  
**Last Updated:** February 15, 2026  
**Next Review:** v0.2.0 release
