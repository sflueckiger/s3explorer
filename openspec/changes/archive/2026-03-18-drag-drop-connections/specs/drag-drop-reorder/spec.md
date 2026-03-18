## ADDED Requirements

### Requirement: Drag connections within group
The system SHALL allow users to reorder connections within the same connection group using drag & drop.

#### Scenario: Reorder within group
- **WHEN** user drags a connection to a different position within the same group
- **THEN** the connection moves to the new position and the order is persisted

#### Scenario: Visual feedback during drag
- **WHEN** user starts dragging a connection
- **THEN** the dragged item shows elevated styling and a drop indicator shows the target position

#### Scenario: Cancel drag
- **WHEN** user releases drag outside a valid drop zone or presses Escape
- **THEN** the connection returns to its original position

### Requirement: Drag connections between groups
The system SHALL allow users to move connections from one connection group to another using drag & drop.

#### Scenario: Move to different group
- **WHEN** user drags a connection and drops it on a different group
- **THEN** a confirmation dialog appears asking to confirm the move

#### Scenario: Confirm move
- **WHEN** user confirms the move in the dialog
- **THEN** the connection is removed from the source group and added to the target group

#### Scenario: Cancel move
- **WHEN** user cancels the move dialog
- **THEN** the connection stays in its original group

### Requirement: Unlock target group on move
The system SHALL prompt for password when moving to a locked group.

#### Scenario: Drop on locked group
- **WHEN** user drops a connection on a locked group
- **THEN** a password prompt appears before the move confirmation

#### Scenario: Correct password
- **WHEN** user enters the correct password for the locked group
- **THEN** the group unlocks and the move confirmation dialog appears

#### Scenario: Wrong password
- **WHEN** user enters an incorrect password
- **THEN** an error is shown and the move is cancelled

### Requirement: Move confirmation dialog
The system SHALL show a confirmation dialog when moving connections between groups that explains the operation.

#### Scenario: Dialog content
- **WHEN** the move confirmation dialog appears
- **THEN** it shows the connection name, source group name, target group name, and explains this removes from source and adds to target

#### Scenario: Dialog actions
- **WHEN** the move confirmation dialog is shown
- **THEN** it has Cancel and Move buttons

### Requirement: Persist connection order
The system SHALL persist the order of connections within each group.

#### Scenario: Order survives reload
- **WHEN** user reorders connections and reloads the page
- **THEN** the connections appear in the saved order

#### Scenario: Order in config file
- **WHEN** connections are reordered
- **THEN** the connections array in the encrypted config file reflects the new order
