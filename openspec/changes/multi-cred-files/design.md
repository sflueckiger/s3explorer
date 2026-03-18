## Context

Currently the app supports a single credential file at a time. The session service holds one decrypted config, and the UI assumes all connections belong to that single source. Users working with multiple S3 environments (personal/work, different projects) must manually switch between credential files.

## Goals / Non-Goals

**Goals:**
- Support multiple credential files open simultaneously
- Independent unlock/lock state per file
- Visual grouping in sidebar by credential file
- Per-file "add connection" action
- Persist known file paths in localStorage

**Non-Goals:**
- Merging connections across files
- Syncing or copying connections between files
- Credential file discovery/scanning

## Decisions

### D1: Multi-config session state
Store a `Map<configPath, { config: Config, password: string }>` in session service instead of single config.

**Rationale:** Each file needs its own unlock state and password for re-encryption during connection edits.

**Alternatives:**
- Single active file with file switching → Poor UX for multi-environment users
- Unified in-memory store → Loses file provenance, complicates password management

### D2: Config path as primary identifier
Use the expanded config file path as the unique identifier for each credential source.

**Rationale:** Paths are inherently unique on the filesystem. Connection IDs remain UUIDs but are scoped to their parent config.

### D3: API routes with configPath parameter
Add `configPath` query parameter to auth and connection routes. Default to `~/.s3explore/config.enc` for backwards compatibility.

**Rationale:** Allows operating on specific files without breaking existing single-file behavior.

### D4: Sidebar grouping with hairline separators
Each credential file group shows:
- Hairline separator above (except first)
- Italic path label (e.g., `~/.s3explore/config.enc`)
- "+" button inline with label for adding connections
- Connections listed below

**Rationale:** Matches user's request. Italic for subtle differentiation, inline "+" is compact.

### D5: localStorage for known paths
Store array of previously-used credential file paths in `localStorage.s3explore.knownPaths`.

**Rationale:** Quick access to recent files without browsing. Survives page refresh.

### D6: Lock status per file
Each credential file can be locked/unlocked independently. Locking removes it from session but keeps it in knownPaths.

**Rationale:** Users may want to temporarily hide sensitive connections without losing quick access.

## Risks / Trade-offs

**[Risk] Path collision after move/rename** → Display error if file not found, offer to remove from known paths

**[Risk] Memory usage with many open files** → Acceptable for typical use (< 10 files). Not optimizing for hundreds.

**[Risk] Password confusion across files** → Show file path clearly when prompting for password

**[Trade-off] API complexity** → Added configPath parameter to most routes, but enables the feature cleanly
