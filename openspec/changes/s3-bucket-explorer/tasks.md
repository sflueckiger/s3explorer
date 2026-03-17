## 1. Project Setup

- [ ] 1.1 Initialize Bun workspace with backend and frontend packages
- [ ] 1.2 Set up Elysia backend with basic health check endpoint
- [ ] 1.3 Set up React frontend with Vite and TypeScript
- [ ] 1.4 Install and configure shadcn/ui with Tailwind CSS
- [ ] 1.5 Set up Eden Treaty for typed API communication
- [ ] 1.6 Configure dev scripts to run backend and frontend concurrently

## 2. Credential Management

- [ ] 2.1 Create encryption service with Argon2id key derivation and AES-256-GCM
- [ ] 2.2 Implement config file read/write with path expansion (~)
- [ ] 2.3 Create POST /unlock endpoint to decrypt and load config
- [ ] 2.4 Create POST /change-password endpoint to re-encrypt config
- [ ] 2.5 Implement in-memory session state for decrypted connections
- [ ] 2.6 Add first-run detection (no config file exists)

## 3. Connection Management

- [ ] 3.1 Define Connection type and validation schema
- [ ] 3.2 Create GET /connections endpoint to list all connections
- [ ] 3.3 Create POST /connections endpoint to add new connection
- [ ] 3.4 Create PUT /connections/:id endpoint to update connection
- [ ] 3.5 Create DELETE /connections/:id endpoint to remove connection
- [ ] 3.6 Implement S3 connection validation on save (test list bucket)
- [ ] 3.7 Create lazy S3Client instance manager (Map<connId, S3Client>)

## 4. Bucket Browsing API

- [ ] 4.1 Create GET /browse/:connId endpoint with prefix query param
- [ ] 4.2 Implement S3 list with delimiter for folder synthesis
- [ ] 4.3 Add pagination support via startAfter parameter
- [ ] 4.4 Return structured response with folders and files separated
- [ ] 4.5 Include file metadata (size, lastModified) in response

## 5. File Operations API

- [ ] 5.1 Create GET /file/:connId/*path endpoint for streaming file content
- [ ] 5.2 Set appropriate Content-Type headers based on file extension
- [ ] 5.3 Create GET /download/:connId/*path endpoint with Content-Disposition
- [ ] 5.4 Implement streaming from S3 to response (no buffering)
- [ ] 5.5 Add file size limits for preview requests (10MB images, 1MB text)

## 6. Unlock Screen UI

- [ ] 6.1 Create UnlockScreen component with password input
- [ ] 6.2 Add optional config path override input
- [ ] 6.3 Implement unlock flow calling POST /unlock
- [ ] 6.4 Add error handling for wrong password
- [ ] 6.5 Create onboarding flow for first-run (set password, add connection)

## 7. Connection Sidebar UI

- [ ] 7.1 Create ConnectionSidebar component with connection list
- [ ] 7.2 Create AddConnectionModal with form fields
- [ ] 7.3 Create EditConnectionModal pre-filled with connection data
- [ ] 7.4 Add delete confirmation dialog
- [ ] 7.5 Implement connection click to open bucket tab
- [ ] 7.6 Add settings button for change password flow

## 8. Tab Navigation UI

- [ ] 8.1 Create TabBar component for open bucket tabs
- [ ] 8.2 Implement tab open/close/switch functionality
- [ ] 8.3 Add "+" button to open connection selector
- [ ] 8.4 Store active tabs in React state
- [ ] 8.5 Handle tab close when connection is deleted

## 9. Column Browser UI

- [ ] 9.1 Create ColumnBrowser container component
- [ ] 9.2 Create Column component for single directory listing
- [ ] 9.3 Implement column navigation (click folder → add column)
- [ ] 9.4 Handle column selection (click earlier → remove later columns)
- [ ] 9.5 Add horizontal ScrollArea for deep navigation
- [ ] 9.6 Create Breadcrumb component for path display
- [ ] 9.7 Implement infinite scroll pagination within columns
- [ ] 9.8 Add file/folder icons based on type
- [ ] 9.9 Display file size in human-readable format

## 10. Preview Panel UI

- [ ] 10.1 Create PreviewPanel component container
- [ ] 10.2 Implement image preview with scaling
- [ ] 10.3 Implement text preview with syntax highlighting for JSON
- [ ] 10.4 Display file metadata (name, size, modified, type)
- [ ] 10.5 Add download button in preview panel
- [ ] 10.6 Handle unsupported formats (show metadata only)
- [ ] 10.7 Add loading and error states

## 11. Download Functionality

- [ ] 11.1 Wire download button to /download endpoint
- [ ] 11.2 Add context menu download option in columns
- [ ] 11.3 Show download progress toast for large files
- [ ] 11.4 Handle download errors with retry option

## 12. Polish & Integration

- [ ] 12.1 Add Toast notifications for success/error feedback
- [ ] 12.2 Implement connection status indicator in tabs
- [ ] 12.3 Add loading states for all async operations
- [ ] 12.4 Test with multiple S3-compatible services (AWS, R2, MinIO)
- [ ] 12.5 Add error boundary for graceful error handling
