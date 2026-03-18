## MODIFIED Requirements

### Requirement: Master password unlock
The system SHALL require the user to enter a master password to decrypt and access stored credentials, with support for multiple concurrent files.

#### Scenario: Successful unlock
- **WHEN** user enters the correct password for a specific config file
- **THEN** credentials are decrypted and held in memory for that file only

#### Scenario: Failed unlock
- **WHEN** user enters an incorrect password for a specific file
- **THEN** the system displays an error showing the file path and allows retry

#### Scenario: Session memory only
- **WHEN** the application is closed
- **THEN** decrypted credentials for all files are cleared from memory

#### Scenario: Multiple files unlocked
- **WHEN** user unlocks multiple credential files
- **THEN** each file's credentials are stored separately in memory with their respective passwords

### Requirement: Config file path override
The system SHALL allow users to specify credential file paths dynamically, supporting multiple files.

#### Scenario: Custom path via dialog
- **WHEN** user enters a custom path in the "Add Credential File" dialog
- **THEN** the system attempts to unlock that file

#### Scenario: Path persistence for session
- **WHEN** user unlocks a file with a custom path
- **THEN** all operations on that file's connections use that path

#### Scenario: Multiple paths active
- **WHEN** user has unlocked files at different paths
- **THEN** each file's operations (add/edit connections, change password) target the correct path

### Requirement: Change master password
The system SHALL allow users to change the master password for a specific credential file while it is unlocked.

#### Scenario: Successful password change
- **WHEN** user provides current password and new password for a specific file
- **THEN** the system re-encrypts that config file with the new password

#### Scenario: File-specific password change
- **WHEN** user changes password for one credential file
- **THEN** other unlocked files remain unaffected
