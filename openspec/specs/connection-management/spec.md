## ADDED Requirements

### Requirement: Connection data model
The system SHALL store connections with the following fields: id (UUID), name (display name), bucket, endpoint (optional), region (optional), accessKeyId, secretAccessKey, sessionToken (optional), color (optional).

#### Scenario: Minimal connection
- **WHEN** creating a connection for AWS S3 with default region
- **THEN** only name, bucket, accessKeyId, and secretAccessKey are required

#### Scenario: Custom endpoint connection
- **WHEN** creating a connection for R2, MinIO, or other S3-compatible services
- **THEN** user can specify a custom endpoint URL

#### Scenario: Connection with color
- **WHEN** creating a connection with a color selected
- **THEN** the color key is stored with the connection data

### Requirement: List connections
The system SHALL display all saved connections in a sidebar list.

#### Scenario: Connection list display
- **WHEN** user is on the main screen
- **THEN** all connections are listed in the sidebar with their display names

#### Scenario: Empty state
- **WHEN** no connections exist
- **THEN** the sidebar shows a prompt to add the first connection

### Requirement: Add new connection
The system SHALL allow users to add new S3 connections via a modal form.

#### Scenario: Add connection form
- **WHEN** user clicks "Add Connection"
- **THEN** a modal appears with fields for name, bucket, endpoint, region, accessKeyId, secretAccessKey, sessionToken

#### Scenario: Successful add
- **WHEN** user submits valid connection details
- **THEN** the connection is saved to the encrypted config and appears in the sidebar

#### Scenario: Validation errors
- **WHEN** user submits with missing required fields
- **THEN** the system displays field-level validation errors

### Requirement: Edit connection
The system SHALL allow users to edit existing connection details.

#### Scenario: Edit connection form
- **WHEN** user clicks edit on a connection
- **THEN** a modal appears pre-filled with the connection's current details

#### Scenario: Successful edit
- **WHEN** user saves changes
- **THEN** the connection is updated in the encrypted config

#### Scenario: Edit preserves ID
- **WHEN** user edits a connection
- **THEN** the connection's ID remains unchanged

### Requirement: Delete connection
The system SHALL allow users to delete connections.

#### Scenario: Delete confirmation
- **WHEN** user clicks delete on a connection
- **THEN** the system asks for confirmation before deleting

#### Scenario: Successful delete
- **WHEN** user confirms deletion
- **THEN** the connection is removed from the config and closes any open tabs for it

### Requirement: Connection validation on save
The system SHALL validate connection credentials before saving.

#### Scenario: Valid credentials
- **WHEN** user saves a connection with valid S3 credentials
- **THEN** the system tests the connection by listing the bucket root and saves on success

#### Scenario: Invalid credentials
- **WHEN** user saves a connection with invalid credentials
- **THEN** the system displays the S3 error and does not save

### Requirement: S3-compatible service support
The system SHALL support connections to any S3-compatible service including AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO, Google Cloud Storage, and Supabase.

#### Scenario: AWS S3
- **WHEN** endpoint is not specified
- **THEN** the system uses AWS S3 with the specified region (defaulting to us-east-1)

#### Scenario: Custom endpoint
- **WHEN** endpoint is specified
- **THEN** the system uses that endpoint for all S3 operations

### Requirement: Reorder connections API
The system SHALL provide an API endpoint to reorder connections within a group.

#### Scenario: Reorder connections
- **WHEN** PUT /connections/reorder is called with configPath and connectionIds array
- **THEN** the connections in that config file are reordered to match the provided order

#### Scenario: Invalid connection IDs
- **WHEN** PUT /connections/reorder is called with IDs that don't exist in the config
- **THEN** a 400 error is returned with details

#### Scenario: Config not unlocked
- **WHEN** PUT /connections/reorder is called for a locked config
- **THEN** a 401 error is returned

### Requirement: Move connection API
The system SHALL provide an API endpoint to move a connection from one group to another.

#### Scenario: Move connection
- **WHEN** POST /connections/move is called with connectionId, sourceConfigPath, targetConfigPath
- **THEN** the connection is removed from source and added to target

#### Scenario: Move with target index
- **WHEN** POST /connections/move includes targetIndex
- **THEN** the connection is inserted at that position in the target group

#### Scenario: Source not unlocked
- **WHEN** POST /connections/move is called and source config is locked
- **THEN** a 401 error is returned indicating source must be unlocked

#### Scenario: Target not unlocked
- **WHEN** POST /connections/move is called and target config is locked
- **THEN** a 401 error is returned indicating target must be unlocked

#### Scenario: Connection not found
- **WHEN** POST /connections/move is called with non-existent connectionId
- **THEN** a 404 error is returned

#### Scenario: Atomic operation
- **WHEN** POST /connections/move is called
- **THEN** both source and target config files are updated atomically (either both succeed or neither)

### Requirement: Connection color selection
The system SHALL allow users to select a color for each connection from a predefined palette.

#### Scenario: Color palette options
- **WHEN** user opens the add or edit connection dialog
- **THEN** a color picker displays 10 color options: powder-blush (#ffac92), cotton-rose (#e8b5b6), peach-glow (#ffcd9e), thistle (#d3c1e7), pink-orchid (#e7c0eb), frozen-water (#d2fffa), lemon-chiffon (#fff9be), tea-green (#c4ffdf), lavender (#d3d3e0), light-cyan (#caf6fc)

#### Scenario: Color picker UI
- **WHEN** viewing the color picker
- **THEN** colors are displayed as circles, with the selected color showing a checkmark inside

#### Scenario: No color option
- **WHEN** user does not select a color
- **THEN** the connection is saved without a color (undefined)

#### Scenario: Color change
- **WHEN** user edits a connection and selects a different color
- **THEN** the new color is saved and immediately reflected in the sidebar

### Requirement: Connection color display
The system SHALL display a color indicator next to connection names in the sidebar.

#### Scenario: Color indicator visibility
- **WHEN** displaying a connection that has a color assigned
- **THEN** a small filled circle of that color appears to the left of the connection name

#### Scenario: No color indicator
- **WHEN** displaying a connection without a color assigned
- **THEN** no color indicator is shown (connection name displays normally)

### Requirement: Sidebar connection grouping
The system SHALL group connections in the sidebar by their source credential file.

#### Scenario: Visual grouping
- **WHEN** multiple credential files are unlocked
- **THEN** each file's connections appear in a separate group with a hairline separator between groups

#### Scenario: File path header
- **WHEN** displaying a credential file group
- **THEN** the group shows an italic label with the file path (e.g., `~/.s3explore/config.enc`)

#### Scenario: Locked file display
- **WHEN** a known credential file is locked
- **THEN** it appears as a collapsed group with lock icon and "Unlock" action

### Requirement: Per-file add connection
The system SHALL allow adding connections to a specific credential file.

#### Scenario: Inline add button
- **WHEN** a credential file group is displayed
- **THEN** a "+" button appears inline with the file path header

#### Scenario: Add to specific file
- **WHEN** user clicks the "+" button for a credential file
- **THEN** the "Add Connection" dialog opens with that file pre-selected as the target

#### Scenario: Connection stored in correct file
- **WHEN** user adds a connection via a file's "+" button
- **THEN** the connection is saved to that specific credential file only

### Requirement: Connection file association
The system SHALL track which credential file each connection belongs to.

#### Scenario: Connection provenance
- **WHEN** displaying connection details
- **THEN** the source credential file path is available (for edit/delete operations)

#### Scenario: Edit targets correct file
- **WHEN** user edits a connection
- **THEN** changes are saved to the connection's source credential file

#### Scenario: Delete from correct file
- **WHEN** user deletes a connection
- **THEN** the connection is removed from its source credential file only
