## Context

S3 Explorer is a monorepo with:
- `packages/backend/` - Bun/Elysia API server
- `packages/frontend/` - React/Vite SPA

For npm publishing, we need a single executable entry point that:
1. Starts the backend server
2. Serves the built frontend
3. Opens the browser

Currently, frontend uses hardcoded `localhost:3333` for API calls.

## Goals / Non-Goals

**Goals:**
- Single command to run: `bunx @sflueckiger/s3explore`
- Professional README with clear install/usage instructions
- MIT license for open source
- Clean package.json with proper metadata
- No console.logs or debug code in production
- Frontend works with relative API paths (same origin)

**Non-Goals:**
- Docker support (future enhancement)
- Windows support testing (community can report issues)
- Automated releases/CI (manual for now)

## Decisions

### Single executable via bin entry
Create `bin/s3explore.ts` that:
1. Serves built frontend from backend (static files)
2. Starts on available port
3. Opens browser automatically

### Frontend API URL handling
Change from hardcoded `localhost:3333` to relative paths. When served from same origin, `/api/*` routes will work.

### Package structure
```
@sflueckiger/s3explore
├── bin/s3explore.ts      # CLI entry point
├── packages/backend/     # API server
├── packages/frontend/    # Pre-built static files
└── README.md
```

### npm publish configuration
- `name`: "@sflueckiger/s3explore"
- `bin`: { "s3explore": "./bin/s3explore.ts" }
- Files to include: bin/, packages/, README.md, LICENSE

## Risks / Trade-offs

**[Risk] Bun required** → Clear documentation that bun is required. Most users can install via `curl -fsSL https://bun.sh/install | bash`

**[Risk] Port conflicts** → Use dynamic port finding, display URL clearly

**[Risk] API URL changes break dev mode** → Keep dev mode working with separate backend/frontend on different ports
