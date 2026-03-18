## 1. Package Configuration

- [x] 1.1 Update root package.json with npm publish metadata (name: @sflueckiger/s3explore, description, keywords, repository, author, license)
- [x] 1.2 Add bin entry pointing to CLI entry script
- [x] 1.3 Configure files array for npm publish (include only necessary files)
- [x] 1.4 Add LICENSE file (MIT)

## 2. CLI Entry Point

- [x] 2.1 Create bin/s3explore.ts that starts the server
- [x] 2.2 Add static file serving for frontend build to backend
- [x] 2.3 Implement dynamic port finding if default port is in use
- [x] 2.4 Auto-open browser on startup

## 3. Frontend API Configuration

- [x] 3.1 Update frontend API client to use relative URLs (or configurable base)
- [x] 3.2 Update any hardcoded localhost:3333 references
- [x] 3.3 Ensure dev mode still works with separate ports

## 4. Code Cleanup

- [x] 4.1 Remove console.log statements (except intentional CLI output)
- [x] 4.2 Remove unused imports and dead code
- [x] 4.3 Review and remove any development-only code

## 5. Security Review

- [x] 5.1 Ensure no secrets or credentials in codebase
- [x] 5.2 Verify credentials are never logged or exposed via API
- [x] 5.3 Check for any unsafe operations

## 6. Documentation

- [x] 6.1 Create comprehensive README.md with install, usage, features, screenshots section placeholders
- [x] 6.2 Document security model (encryption, credential handling)
- [x] 6.3 Add contributing guidelines section

## 7. Final Verification

- [x] 7.1 Test bunx execution locally (npm pack + bunx)
- [x] 7.2 Verify all features work in production build
- [x] 7.3 Build passes without errors or warnings
