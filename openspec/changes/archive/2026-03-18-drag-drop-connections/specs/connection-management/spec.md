## ADDED Requirements

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
