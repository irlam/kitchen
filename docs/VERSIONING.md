# Versioning and Release Management
## KitchenLab Pro - Git Tagging and Changelog Guidelines

**Document Version:** 1.0  
**Last Updated:** February 15, 2026

---

## 🎯 OVERVIEW

This document defines the versioning strategy, git tagging process, and changelog maintenance for KitchenLab Pro.

**Versioning Scheme:** Semantic Versioning (SemVer 2.0.0)  
**Format:** `MAJOR.MINOR.PATCH` (e.g., `v0.1.0`)

---

## 📋 SEMANTIC VERSIONING

### Version Number Format: `MAJOR.MINOR.PATCH`

**MAJOR version** (e.g., `1.0.0` → `2.0.0`)
- Incompatible API changes
- Breaking changes to existing functionality
- Major architectural rewrites
- Database schema changes requiring migration

**Examples:**
- Removing deprecated features
- Changing API endpoint structure
- Requiring different runtime dependencies
- Converting from SQLite to PostgreSQL

**MINOR version** (e.g., `0.1.0` → `0.2.0`)
- New features added (backward compatible)
- Significant enhancements to existing features
- New APIs or capabilities
- Dependency updates (minor versions)

**Examples:**
- Adding auto-snap during drag (Phase 4)
- Visual collision warnings UI
- Catalog search UI controls
- New export formats (SVG, DXF)

**PATCH version** (e.g., `0.1.0` → `0.1.1`)
- Bug fixes (backward compatible)
- Security patches
- Performance improvements
- Documentation updates
- Minor dependency updates

**Examples:**
- Fixing dimension display bug
- Patching security vulnerability
- Correcting calculation error
- Updating documentation

### Pre-Release Versions

**Alpha:** `v0.1.0-alpha.1`, `v0.1.0-alpha.2`
- Early testing, unstable, incomplete features
- Internal testing only
- May have breaking changes between alpha versions

**Beta:** `v0.1.0-beta.1`, `v0.1.0-beta.2`
- Feature complete, may have bugs
- External testing / user acceptance testing
- API relatively stable
- No new features, only bug fixes

**Release Candidate:** `v0.1.0-rc.1`, `v0.1.0-rc.2`
- Final testing before release
- Only critical bug fixes
- Production-ready unless issues found

### Development Versions

**Development:** `v0.2.0-dev` (main branch, unreleased)
- Active development
- Not for production use
- May be unstable

---

## 🏷️ GIT TAGGING PROCESS

### Creating a Release Tag

**Step 1: Ensure Clean State**

```bash
# Verify working directory clean
git status

# Should output:
# On branch main
# nothing to commit, working tree clean
```

**Step 2: Update Version in Code**

Update `package.json`:
```json
{
  "name": "kitchen-lab-pro",
  "version": "0.1.0",  // ← Update this
  ...
}
```

Commit version bump:
```bash
git add package.json
git commit -m "Bump version to v0.1.0"
```

**Step 3: Create Annotated Tag**

```bash
# Create annotated tag (recommended)
git tag -a v0.1.0 -m "Release v0.1.0 - Initial Production Release

- Core dimension system (Phase 1)
- Snap-to-grid, collision, catalog enhancements (Phase 2)
- Release hardening and testing (Phase 3)
- 141/141 tests passing
- 0 production vulnerabilities"

# Verify tag created
git tag -l "v0.1.*"
```

**Step 4: Push Tag to Remote**

```bash
# Push specific tag
git push origin v0.1.0

# Or push all tags
git push --tags
```

**Step 5: Create GitHub Release**

1. Navigate to: `https://github.com/irlam/kitchen/releases/new`
2. Select tag: `v0.1.0`
3. Release title: `KitchenLab Pro v0.1.0 - Initial Production Release`
4. Description: Copy from RELEASE_NOTES_DRAFT.md
5. Attach: Build artifacts (optional)
   - `kitchen-v0.1.0-dist.zip` (dist/ folder zipped)
   - `kitchen-v0.1.0-source.tar.gz` (GitHub auto-generates)
6. Check: **Set as latest release**
7. Click: **Publish release**

### Viewing Tags

```bash
# List all tags
git tag

# List tags matching pattern
git tag -l "v0.1.*"

# Show tag details
git show v0.1.0

# Show tag commit
git log v0.1.0 -1

# Checkout specific tag
git checkout v0.1.0
```

### Deleting Tags (If Needed)

```bash
# Delete local tag
git tag -d v0.1.0

# Delete remote tag
git push origin :refs/tags/v0.1.0

# Or delete remote tag (newer syntax)
git push origin --delete v0.1.0
```

---

## 📝 CHANGELOG MAINTENANCE

### Changelog File: `CHANGELOG.md`

**Location:** Root directory of repository

**Format:** Keep a Changelog (keepachangelog.com)

**Template:**

```markdown
# Changelog
All notable changes to KitchenLab Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Features planned but not yet released

### Changed
- Changes to existing features

## [0.1.0] - 2026-02-15

### Added
- Core dimension system with 2D and 3D labels
- Multi-unit support (cm, mm, m, inches, feet+inches)
- Snap-to-grid functionality (manual button)
- Collision detection logic (tested)
- Catalog search/filter logic (tested)
- Comprehensive test suite (141 tests)
- Release documentation

### Fixed
- 3D dimension labels now visible by default (Phase 1B fix)
- Dimension precision improved (no floating point artifacts)
- Three.js security vulnerability patched (updated to 0.137.0)

### Security
- Updated three.js from 0.124.0 to 0.137.0 (HIGH DoS vulnerability fixed)
- SQL injection protection via prepared statements

### Known Issues
- Build warnings (CSS syntax, bundle size) - non-functional
- 2 moderate dev-only vulnerabilities (esbuild, vite)
- Auto-snap during drag not implemented (logic ready)
- Visual collision warnings not in UI (logic ready)
- Catalog search UI not implemented (logic ready)

[Unreleased]: https://github.com/irlam/kitchen/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/irlam/kitchen/releases/tag/v0.1.0
```

### Changelog Update Process

**When to Update:**

1. **During Development** (Unreleased section):
   - Add new features under `### Added`
   - Document changes under `### Changed`
   - Note deprecations under `### Deprecated`
   - List bug fixes under `### Fixed`

2. **Before Release:**
   - Move `[Unreleased]` items to new version section
   - Add release date
   - Create new empty `[Unreleased]` section
   - Update comparison links at bottom

**Example Workflow:**

```bash
# 1. Make code change
git commit -m "Add keyboard shortcuts for undo/redo"

# 2. Update CHANGELOG.md immediately
# Add under [Unreleased] > ### Added:
# - Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)

git add CHANGELOG.md
git commit -m "docs: Update changelog for keyboard shortcuts"

# 3. When ready to release v0.2.0:
# Move all [Unreleased] items to [0.2.0] section
# Add release date
# Create new [Unreleased] section

git add CHANGELOG.md
git commit -m "docs: Prepare changelog for v0.2.0 release"
git tag -a v0.2.0 -m "Release v0.2.0"
git push && git push --tags
```

### Changelog Categories

**Added** - New features
```markdown
### Added
- Keyboard shortcuts for common operations
- Catalog search UI with real-time filtering
- Auto-snap during drag operations
- Visual collision warnings
```

**Changed** - Changes to existing features
```markdown
### Changed
- Improved dimension label positioning algorithm
- Updated UI styling for properties panel
- Enhanced 3D rendering performance
```

**Deprecated** - Features marked for removal
```markdown
### Deprecated
- localStorage save methods (use server-side API instead)
- Legacy dimension format (use new utility functions)
```

**Removed** - Features removed
```markdown
### Removed
- Dead localStorage functions (lines 151-166 in app.js)
- Unused CSS classes
```

**Fixed** - Bug fixes
```markdown
### Fixed
- 3D dimensions now visible by default
- Floating point precision in dimension display
- CORS policy restricted to production domain
- CSS ID syntax warning (#3D-Floorplan renamed to #floorplan-3d)
```

**Security** - Security fixes
```markdown
### Security
- Updated three.js to 0.137.0 (DoS vulnerability)
- Updated vite to 7.3.1+ (dev server vulnerability)
- Restricted CORS to production domain only
```

---

## 🔄 RELEASE WORKFLOW

### Full Release Process

**1. Pre-Release Preparation**

```bash
# Create release branch
git checkout -b release/v0.2.0

# Update version number
# Edit package.json: "version": "0.2.0"

# Update CHANGELOG.md
# Move [Unreleased] items to [0.2.0] section
# Add release date

# Update RELEASE_NOTES_DRAFT.md (if major release)

# Commit changes
git add package.json CHANGELOG.md
git commit -m "chore: Prepare v0.2.0 release"
```

**2. Testing**

```bash
# Run full test suite
npm test

# Run build
npm run build

# Run security audit
npm audit --omit=dev

# Manual smoke testing
# Follow SMOKE_TEST.md procedure
```

**3. Create Tag and Release**

```bash
# Merge to main (if using release branch)
git checkout main
git merge release/v0.2.0

# Create annotated tag
git tag -a v0.2.0 -m "Release v0.2.0 - Security Updates and Enhancements"

# Push to remote
git push origin main
git push origin v0.2.0
```

**4. Deploy to Production**

```bash
# Build production bundle
npm run build

# Follow DEPLOY_CPANEL.md instructions
# Upload dist/ to production server

# Run post-deploy smoke tests
# Follow SMOKE_TEST.md
```

**5. Post-Release**

```bash
# Create new development version
# Edit package.json: "version": "0.3.0-dev"

git add package.json
git commit -m "chore: Begin v0.3.0 development"
git push
```

---

## 📊 VERSION HISTORY

### v0.1.0 (February 15, 2026) - Initial Production Release

**Type:** MINOR (first production release)  
**Git Tag:** `v0.1.0`  
**Branch:** `main`  
**Commit:** `cb4f429` (approximate)

**Major Features:**
- Core dimension system (Phase 1)
- 3D dimension visibility fix (Phase 1B)
- Snap-to-grid, collision, catalog enhancements (Phase 2)
- Release hardening (Phase 3)

**Metrics:**
- Tests: 141/141 passing
- Build time: 2.5s
- Bundle size: 987KB (257KB gzipped)
- Security: 0 production vulnerabilities

**Next Version:** v0.2.0 (planned Q2 2026)

### Future Versions (Planned)

**v0.2.0 (Q2 2026) - Security & Polish**
- Update dev dependencies (vite 7.3.1+)
- Restrict CORS policy
- Fix CSS ID warning
- Code quality improvements

**v0.3.0 (Q3 2026) - Code Quality**
- Remove dead code
- Project name validation
- Performance optimizations

**v0.4.0 (Q4 2026) - UI Integration**
- Auto-snap during drag
- Visual collision warnings
- Catalog search UI
- Keyboard shortcuts

---

## 🔐 BRANCH PROTECTION

### Protected Branches

**main** (production)
- Require pull request reviews
- Require status checks to pass
- Require signed commits (recommended)
- Include administrators (no bypass)

**release/** (release branches)
- Require pull request reviews
- Require status checks to pass

### Merge Strategy

**Feature branches** → `main`
- Squash and merge (clean history)

**Release branches** → `main`
- Create merge commit (preserve release history)

**Hotfixes** → `main`
- Create merge commit
- Tag immediately
- Cherry-pick to develop if needed

---

## 📅 RELEASE SCHEDULE

### Regular Release Cadence

**Major Releases:** Annual (v1.0.0, v2.0.0)
- Significant architecture changes
- Breaking changes
- Major new features

**Minor Releases:** Quarterly (v0.1.0, v0.2.0, v0.3.0, v0.4.0)
- New features
- Enhancements
- Non-breaking changes

**Patch Releases:** As needed (v0.1.1, v0.1.2)
- Bug fixes
- Security patches
- Urgent fixes

### Emergency Releases

**Hotfix Process:**
1. Create branch from tagged release: `git checkout -b hotfix/v0.1.1 v0.1.0`
2. Fix critical issue
3. Update CHANGELOG.md
4. Bump PATCH version
5. Tag: `v0.1.1`
6. Deploy immediately
7. Backport fix to main/develop

**Example:**
```bash
git checkout -b hotfix/v0.1.1 v0.1.0
# Fix critical bug
git add .
git commit -m "fix: Critical save/load database issue"
# Update package.json to 0.1.1
# Update CHANGELOG.md
git tag -a v0.1.1 -m "Hotfix v0.1.1 - Critical save/load fix"
git push origin hotfix/v0.1.1
git push origin v0.1.1
```

---

## 📝 COMMIT MESSAGE CONVENTIONS

Follow Conventional Commits (conventionalcommits.org):

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Code restructuring
- `perf:` Performance improvement
- `test:` Adding tests
- `chore:` Build process, dependencies
- `security:` Security fixes

**Examples:**
```bash
git commit -m "feat(catalog): Add real-time search filtering UI"
git commit -m "fix(dimensions): Resolve 3D label visibility on load"
git commit -m "docs(deploy): Add cPanel deployment instructions"
git commit -m "security(deps): Update three.js to 0.137.0"
git commit -m "chore(release): Prepare v0.2.0 release"
```

---

## 🛠️ TOOLS

### Recommended Tools

**Version Bump:**
```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0
```

**Changelog Generation:**
- Manual (recommended for KitchenLab Pro)
- Auto via: `conventional-changelog` (if using conventional commits)

**Tag Management:**
```bash
# List tags by date
git tag --sort=-creatordate

# Find tag for commit
git describe --tags <commit>

# Compare tags
git diff v0.1.0..v0.2.0
```

---

## 📋 RELEASE CHECKLIST

**Pre-Release:**
- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Security audit clean: `npm audit --omit=dev`
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] RELEASE_NOTES_DRAFT.md updated (if major)
- [ ] Documentation reviewed

**Release:**
- [ ] Create annotated git tag
- [ ] Push tag to GitHub
- [ ] Create GitHub release
- [ ] Attach build artifacts
- [ ] Mark as latest release

**Post-Release:**
- [ ] Deploy to production (DEPLOY_CPANEL.md)
- [ ] Run smoke tests (SMOKE_TEST.md)
- [ ] Monitor for issues
- [ ] Update project board/issues
- [ ] Announce release

---

**Document Version:** 1.0  
**Release:** v0.1.0  
**Last Updated:** February 15, 2026  
**Next Review:** v0.2.0 release
