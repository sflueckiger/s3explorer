## ADDED Requirements

### Requirement: Connection data model
The system SHALL store connections with the following fields: id (UUID), name (display name), bucket, endpoint (optional), region (optional), accessKeyId, secretAccessKey, sessionToken (optional).

#### Scenario: Minimal connection
- **WHEN** creating a connection for AWS S3 with default region
- **THEN** only name, bucket, accessKeyId, and secretAccessKey are required

#### Scenario: Custom endpoint connection
- **WHEN** creating a connection for R2, MinIO, or other S3-compatible services
- **THEN** user can specify a custom endpoint URL

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
