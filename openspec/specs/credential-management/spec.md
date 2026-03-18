## ADDED Requirements

### Requirement: Encrypted credential storage
The system SHALL store all S3 credentials in an encrypted file using AES-256-GCM encryption with an Argon2id-derived key from the user's master password.

#### Scenario: Config file structure
- **WHEN** credentials are saved
- **THEN** the config file contains JSON with `salt`, `iv`, and `ciphertext` fields (all base64 encoded)

#### Scenario: Encryption strength
- **WHEN** deriving the encryption key
- **THEN** the system uses Argon2id with secure parameters (memory >= 64MB, iterations >= 3, parallelism >= 1)

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

### Requirement: Default config file path
The system SHALL use `~/.s3explore/config.enc` as the default config file location.

#### Scenario: Default path creation
- **WHEN** no config file exists at the default path
- **THEN** the system creates the directory and file on first save

#### Scenario: Path expansion
- **WHEN** the path contains `~`
- **THEN** the system expands it to the user's home directory

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

#### Scenario: Current password verification
- **WHEN** user attempts to change password with wrong current password
- **THEN** the system rejects the change and displays an error

#### Scenario: New password validation
- **WHEN** user provides a new password
- **THEN** the system requires minimum 8 characters

#### Scenario: File-specific password change
- **WHEN** user changes password for one credential file
- **THEN** other unlocked files remain unaffected

### Requirement: First-run onboarding
The system SHALL guide first-time users through initial setup when no config file exists.

#### Scenario: Onboarding flow
- **WHEN** no config file exists at the target path
- **THEN** the system prompts user to: set master password, then add first connection

#### Scenario: Onboarding creates config
- **WHEN** user completes onboarding
- **THEN** the system creates the encrypted config file with the first connection
