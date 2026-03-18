## Why

Need a local-first S3 bucket explorer that works across multiple S3-compatible services (AWS, R2, MinIO, etc.) with secure credential management. Existing tools are either cloud-based, overly complex, or don't support managing multiple buckets with different credentials in a unified interface.

## What Changes

- Build a complete local web application for browsing S3 buckets
- Implement encrypted credential storage with master password protection
- Create a multi-connection management system with tab-based navigation
- Develop a column-based file browser (Mac Finder style) with preview capabilities
- Support individual file downloads with streaming

## Capabilities

### New Capabilities
- `credential-management`: Encrypted storage and management of S3 connection credentials with master password, change password flow, and config file path override
- `connection-management`: CRUD operations for named S3 connections supporting AWS, R2, MinIO, GCS, DigitalOcean Spaces, Supabase
- `bucket-browsing`: Column-based navigation of S3 bucket contents with prefix-based folder synthesis
- `file-preview`: Preview panel for images (png/jpg/gif/webp/svg) and text files (txt/json/md/yaml/xml/csv)
- `file-download`: Individual file download with proper content-disposition headers

### Modified Capabilities
<!-- No existing capabilities to modify - this is a new application -->

## Impact

- **New codebase**: Elysia backend + React frontend + Eden Treaty for type safety
- **Dependencies**: Bun runtime, Bun's native S3 client, encryption libraries (argon2, AES-256-GCM)
- **File system**: Creates `~/.s3explore/config.enc` (or user-specified path) for encrypted credentials
- **Local only**: No external services, all data stays on user's machine
