## MODIFIED Requirements

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

## ADDED Requirements

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
