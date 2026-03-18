## Context

The monorepo currently has mixed package managers:
- Backend: uses bun (bun runtime + bun as package manager)
- Frontend: uses npm with vite/typescript build

The root has a `bun.lock` file, but frontend also has `package-lock.json`. This causes confusion and inconsistency.

## Goals / Non-Goals

**Goals:**
- Use bun as the package manager for frontend
- Remove npm lockfile from frontend
- Maintain existing build tooling (vite, typescript)
- Keep all existing functionality working

**Non-Goals:**
- Migrating vite to bun's bundler
- Changing the runtime (still runs in browser)
- Modifying any application code

## Decisions

### Use bun for package management only
Keep vite as the bundler. Bun's bundler is still maturing and vite works well. Only change is using `bun install` and `bun run` instead of `npm install` and `npm run`.

### Remove frontend package-lock.json
The root bun.lock already tracks all dependencies. Having both creates version drift risk.

### Update package.json scripts
Scripts like `"dev": "vite"` work with both npm and bun, so minimal changes needed. Just ensure any npm-specific scripts are updated.

## Risks / Trade-offs

**[Risk] Bun compatibility with vite plugins** → Bun has excellent Node.js compatibility; vite plugins should work. If issues arise, can fall back to npm.

**[Risk] CI/CD may need updates** → Any CI scripts using `npm` need to use `bun` instead. This is a simple find-replace.
