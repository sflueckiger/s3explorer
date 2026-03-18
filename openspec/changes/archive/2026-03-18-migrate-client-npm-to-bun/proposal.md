## Why

The frontend currently uses npm as its package manager, while the backend already uses bun. Migrating the frontend to bun will provide consistency across the monorepo, faster installs, and better integration with the existing bun-based tooling.

## What Changes

- Replace npm scripts with bun equivalents in frontend package.json
- Remove npm lockfile (package-lock.json) in favor of existing bun.lock at root
- Update any npm-specific configuration or scripts
- Ensure vite and typescript builds work with bun

## Capabilities

### New Capabilities
<!-- None - this is a tooling migration, not a feature change -->

### Modified Capabilities
<!-- None - no spec-level behavior changes, only build tooling -->

## Impact

- `packages/frontend/package.json`: Update scripts from npm to bun
- `packages/frontend/package-lock.json`: Remove (using root bun.lock)
- Build and dev commands will change from `npm run X` to `bun run X`
- No runtime behavior changes - this is purely build/dev tooling
