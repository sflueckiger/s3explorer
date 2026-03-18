## ADDED Requirements

### Requirement: Multiple credential files in session
The system SHALL support having multiple credential files open simultaneously in a single session.

#### Scenario: Opening second credential file
- **WHEN** user unlocks a second credential file while another is already unlocked
- **THEN** both files remain accessible and their connections are displayed

#### Scenario: Independent file state
- **WHEN** multiple credential files are open
- **THEN** each file maintains its own unlock state, password, and connection list

### Requirement: Known paths persistence
The system SHALL persist previously-used credential file paths in localStorage.

#### Scenario: Path storage on unlock
- **WHEN** user successfully unlocks a credential file
- **THEN** the file path is added to localStorage under `s3explore.knownPaths`

#### Scenario: Path retrieval on load
- **WHEN** the application loads
- **THEN** known paths are read from localStorage and displayed (locked state)

#### Scenario: Path removal
- **WHEN** user explicitly removes a credential file from the sidebar
- **THEN** the path is removed from localStorage known paths

### Requirement: Add new credential file
The system SHALL allow users to add and unlock new credential files at any time.

#### Scenario: Add file button
- **WHEN** user clicks "Add Credential File" in settings
- **THEN** a dialog appears to enter the file path and password

#### Scenario: New file onboarding
- **WHEN** user specifies a path that doesn't exist
- **THEN** the system runs the first-run onboarding flow for that file

### Requirement: Per-file lock action
The system SHALL allow users to lock individual credential files independently.

#### Scenario: Locking one file
- **WHEN** user locks a specific credential file
- **THEN** only that file's connections are hidden; other files remain accessible

#### Scenario: Locked file in sidebar
- **WHEN** a known credential file is locked
- **THEN** it appears in the sidebar with a lock icon and no connections listed
