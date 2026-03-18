## 1. Backend Session Service

- [x] 1.1 Refactor session state from single config to Map<configPath, SessionEntry>
- [x] 1.2 Create SessionEntry type with config, password, and S3 clients
- [x] 1.3 Update isUnlocked() to accept optional configPath parameter
- [x] 1.4 Update getConfig() to accept configPath parameter
- [x] 1.5 Update getS3Client() to accept configPath in addition to connId
- [x] 1.6 Add getUnlockedPaths() to list all currently unlocked config paths
- [x] 1.7 Add unlockConfig(path, password) for multi-file unlock
- [x] 1.8 Add lockConfig(path) for per-file lock

## 2. Backend Auth Routes

- [x] 2.1 Add configPath query parameter to POST /auth/unlock
- [x] 2.2 Add configPath query parameter to POST /auth/lock
- [x] 2.3 Add configPath query parameter to POST /auth/change-password
- [x] 2.4 Update GET /auth/status to return array of config statuses
- [x] 2.5 Create POST /auth/setup with configPath for new file onboarding
- [x] 2.6 Default configPath to ~/.s3explore/config.enc for backwards compatibility

## 3. Backend Connection Routes

- [x] 3.1 Add configPath query parameter to GET /connections
- [x] 3.2 Add configPath query parameter to POST /connections
- [x] 3.3 Add configPath query parameter to PUT /connections/:id
- [x] 3.4 Add configPath query parameter to DELETE /connections/:id
- [x] 3.5 Validate configPath is unlocked before connection operations

## 4. Frontend State Management

- [x] 4.1 Create useKnownPaths hook with localStorage persistence
- [x] 4.2 Create ConfigFile type with path, isUnlocked, connections
- [x] 4.3 Update useAuth hook to support multiple config files
- [x] 4.4 Add unlockFile(path, password) action
- [x] 4.5 Add lockFile(path) action
- [x] 4.6 Add addKnownPath(path) and removeKnownPath(path) actions

## 5. Frontend API Client

- [x] 5.1 Update auth API calls to include configPath parameter
- [x] 5.2 Update connection API calls to include configPath parameter
- [x] 5.3 Create getMultiStatus() to fetch all config file statuses

## 6. Sidebar UI - File Groups

- [x] 6.1 Create CredentialFileGroup component with hairline separator
- [x] 6.2 Add italic path label display (truncated with tooltip)
- [x] 6.3 Add inline "+" button next to file path
- [x] 6.4 Create locked state view with lock icon and "Unlock" button
- [x] 6.5 Render connection list within each unlocked group

## 7. Sidebar UI - File Management

- [x] 7.1 Create AddCredentialFileDialog component
- [x] 7.2 Add "Add Credential File" option to settings dropdown
- [x] 7.3 Create UnlockFileDialog for unlocking known locked files
- [x] 7.4 Add "Remove" option to locked file context menu (removes from known)
- [x] 7.5 Add "Lock" option to unlocked file context menu

## 8. App Initialization

- [x] 8.1 On load, read known paths from localStorage
- [x] 8.2 For each known path, fetch status (exists? unlocked?)
- [x] 8.3 Show all known files in sidebar (locked or unlocked)
- [x] 8.4 Auto-prompt unlock for files that exist but are locked
- [x] 8.5 Handle missing files gracefully (show error, offer remove)

## 9. Connection Operations

- [x] 9.1 Update AddConnectionDialog to accept target configPath
- [x] 9.2 Pass configPath when opening dialog from file group "+" button
- [x] 9.3 Update EditConnectionDialog to use connection's source configPath
- [x] 9.4 Update DeleteConnectionDialog to use connection's source configPath
- [x] 9.5 Include configPath in connection objects for frontend tracking

## 10. Integration & Polish

- [x] 10.1 Update MainApp to coordinate multi-file state
- [x] 10.2 Handle tab closure when parent config is locked
- [x] 10.3 Add loading states for per-file operations
- [x] 10.4 Add error handling for file-not-found scenarios
- [x] 10.5 Test with 3+ credential files simultaneously
