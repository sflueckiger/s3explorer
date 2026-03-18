### Requirement: Connection group naming
The system SHALL allow users to assign a display name to each credential file, referred to as a "Connection Group."

#### Scenario: Setting group name on new file
- **WHEN** user creates a new credential file via "Add Credential File" dialog
- **THEN** the dialog includes a "Group Name" field that is required

#### Scenario: Default name generation
- **WHEN** user leaves the group name field empty
- **THEN** the system derives a default name from the filename (e.g., "config" from "config.enc")

#### Scenario: Name storage
- **WHEN** user saves a connection group with a name
- **THEN** the name is stored inside the encrypted credential file alongside connections

### Requirement: Connection group display
The system SHALL display the group name prominently in the sidebar navigation.

#### Scenario: Group name positioning
- **WHEN** displaying a connection group in the sidebar
- **THEN** the group name appears above the file path, styled prominently (larger/bolder than the path)

#### Scenario: File path visibility
- **WHEN** displaying a connection group in the sidebar
- **THEN** the file path remains visible below the group name in smaller, muted text

### Requirement: Connection group name editing
The system SHALL allow users to rename existing connection groups.

#### Scenario: Rename via context menu
- **WHEN** user accesses the connection group's context menu (three-dot menu)
- **THEN** a "Rename" option is available

#### Scenario: Successful rename
- **WHEN** user submits a new name for the group
- **THEN** the name is updated in the encrypted config file and reflected immediately in the sidebar

### Requirement: Backwards compatibility
The system SHALL handle credential files without a name field gracefully.

#### Scenario: Missing name field
- **WHEN** opening a credential file that has no name field
- **THEN** the system displays the filename as the group name

#### Scenario: No migration required
- **WHEN** user opens an existing credential file without a name
- **THEN** the file remains unchanged until user explicitly sets a name
