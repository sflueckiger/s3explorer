## Context

Building a local-first S3 bucket explorer from scratch. No existing codebase - greenfield project. Target users are developers who need to browse multiple S3-compatible buckets with different credentials.

**Constraints:**
- Must run 100% locally (no cloud dependencies)
- Must use Bun runtime with native S3 client
- Credentials must be encrypted at rest
- UI must support multiple simultaneous bucket connections

**Stack:**
- Backend: Elysia (Bun-native web framework)
- Frontend: React
- Type safety: Eden Treaty (end-to-end typed API)
- S3: Bun's native S3 client (`Bun.S3Client`)

## Goals / Non-Goals

**Goals:**
- Secure local credential storage with master password
- Multi-bucket management with named connections
- Intuitive column-based file browsing (Mac Finder style)
- Preview for images and text files
- Individual file downloads

**Non-Goals:**
- File uploads (deferred)
- Folder zip downloads (deferred)
- File deletion from S3 (deferred)
- Search within buckets (deferred)
- PDF/video preview (deferred)
- Cloud sync or remote access

## Decisions

### D1: Encryption Strategy
**Decision:** AES-256-GCM with Argon2id key derivation

**Rationale:**
- Argon2id is the current best practice for password-based key derivation (memory-hard, resistant to GPU attacks)
- AES-256-GCM provides authenticated encryption (integrity + confidentiality)
- Both are available in Node.js crypto (which Bun supports)

**Alternatives considered:**
- PBKDF2: Older, less resistant to modern attacks
- Plain AES-CBC: No authentication, vulnerable to padding oracle attacks

### D2: Config File Format
**Decision:** Single encrypted JSON file at `~/.s3explore/config.enc`

**Format:**
```json
{
  "salt": "<base64>",
  "iv": "<base64>",
  "ciphertext": "<base64>"
}
```

Decrypted payload:
```json
{
  "connections": [
    {
      "id": "uuid",
      "name": "prod-assets",
      "bucket": "my-bucket",
      "endpoint": "https://...",
      "region": "us-east-1",
      "accessKeyId": "...",
      "secretAccessKey": "..."
    }
  ]
}
```

**Rationale:** Simple, portable, easy to backup. Override path via startup argument supports multiple config files.

### D3: Session State Management
**Decision:** Keep decrypted config in backend memory only

**Flow:**
1. App starts → prompt for password (+ optional config path)
2. Backend decrypts config → holds `Connection[]` in memory
3. Lazy-create `S3Client` instances per connection on first use
4. App closes → memory cleared, nothing persisted unencrypted

**Rationale:** Simplest secure approach. No password storage, no session tokens, no complexity.

### D4: S3 File Access Strategy
**Decision:** Proxy all S3 requests through Elysia backend

**Rationale:**
- Avoids CORS configuration on buckets (which user may not control)
- Consistent behavior across all S3-compatible services
- Backend can stream responses (no memory bloat)
- Loopback latency is negligible for local app

**Alternatives considered:**
- Presigned URLs: Requires bucket CORS configuration, user may not have access

### D5: Column Browser Implementation
**Decision:** Synthesize folder structure from S3 prefix listings

**Approach:**
- Use `S3Client.list({ prefix, delimiter: '/' })` to get "folders" (CommonPrefixes) and files
- Each column represents one level of the path
- Selecting a "folder" loads the next column with that prefix
- Pagination via `startAfter` for large directories

**Rationale:** S3 has no real folders - only keys with slashes. The delimiter parameter makes S3 return CommonPrefixes which act like folders.

### D6: Preview Strategy
**Decision:** Stream through backend, render in frontend

**Image preview:**
- Backend: `GET /file/:connId/*path` streams bytes with correct `Content-Type`
- Frontend: `<img src={apiUrl} />`

**Text preview:**
- Backend: same endpoint, returns text content
- Frontend: `<pre>` with syntax highlighting for JSON/YAML/etc

**Supported formats:**
- Images: png, jpg, jpeg, gif, webp, svg
- Text: txt, json, md, yaml, yml, xml, csv, log

### D7: Project Structure
**Decision:** Monorepo with separate packages

```
/
├── packages/
│   ├── backend/         # Elysia API
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   └── package.json
│   └── frontend/        # React app
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/
│       │   └── hooks/
│       └── package.json
├── package.json         # Workspace root
└── bun.lockb
```

**Rationale:** Clear separation, Eden Treaty works across packages, easy to develop each independently.

### D8: UI Component Library
**Decision:** shadcn/ui with Radix primitives only

**Rationale:**
- shadcn/ui provides well-designed, accessible components
- Built on Radix primitives (proven accessibility)
- Copy-paste approach = full control, no dependency lock-in
- Consistent styling with Tailwind CSS

**Components likely needed:**
- Dialog (unlock screen, add/edit connection modals)
- Tabs (bucket tabs)
- Button, Input, Label (forms)
- ScrollArea (column browser, file lists)
- DropdownMenu (connection actions)
- Toast (notifications)
- Card (preview panel)

## Risks / Trade-offs

**[Risk] Memory usage with large file previews**
→ Mitigation: Stream files, set reasonable size limits for preview (e.g., 10MB for images, 1MB for text)

**[Risk] Password forgotten = data loss**
→ Mitigation: Document clearly that there's no recovery. User must re-create connections.

**[Risk] S3 rate limiting on rapid navigation**
→ Mitigation: Debounce list requests, cache recent results briefly (30s)

**[Trade-off] No offline mode**
→ Acceptable: This is a browser for live S3 data, offline doesn't make sense

**[Trade-off] Single config file = no multi-device sync**
→ Acceptable: Local-first is a feature, not a limitation. Users can manually copy the encrypted file.
