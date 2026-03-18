## Why

The S3 Explorer is ready for public release. Publishing to GitHub and npm will make it available to the community as an easy-to-run tool via `bunx @sflueckiger/s3explore`. Before release, the codebase needs cleanup, security review, and proper documentation.

## What Changes

- Create comprehensive README.md with installation, usage, and screenshots
- Add LICENSE file (MIT)
- Clean up package.json for npm publishing (name, description, keywords, bin entry)
- Remove any development artifacts, console.logs, and dead code
- Ensure no hardcoded secrets or localhost references that would break in production
- Add proper error handling for production use
- Create a single entry point that starts both backend and frontend
- Security audit: validate that credentials are properly handled

## Capabilities

### New Capabilities
<!-- None - this is release preparation, not new features -->

### Modified Capabilities
<!-- None - no spec-level behavior changes -->

## Impact

- Root `package.json`: Configure for npm publishing with bin entry
- `packages/backend/`: Review for hardcoded values, production readiness
- `packages/frontend/`: Build configuration, API URL handling
- `README.md`: Full documentation
- `LICENSE`: MIT license file
- New CLI entry point script for `bunx` execution
