## MODIFIED Requirements

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
