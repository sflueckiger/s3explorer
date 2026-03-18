## ADDED Requirements

### Requirement: Tab-based bucket navigation
The system SHALL display active bucket connections as tabs, allowing users to switch between multiple open buckets.

#### Scenario: Open bucket in tab
- **WHEN** user clicks on a connection in the sidebar
- **THEN** a new tab opens for that bucket (or focuses existing tab if already open)

#### Scenario: Multiple tabs
- **WHEN** user has multiple buckets open
- **THEN** each bucket has its own tab with the connection name as the tab label

#### Scenario: Close tab
- **WHEN** user closes a tab
- **THEN** that bucket view is removed but the connection remains in the sidebar

#### Scenario: Add tab button
- **WHEN** user clicks the "+" button in the tab bar
- **THEN** the system focuses the sidebar for connection selection

### Requirement: Column-based file browser
The system SHALL display bucket contents in a column-based layout similar to Mac Finder's column view, with automatic compaction for deep navigation.

#### Scenario: Initial column
- **WHEN** user opens a bucket tab
- **THEN** the first column shows the root level contents (folders and files)

#### Scenario: Navigate into folder
- **WHEN** user clicks on a folder in a column
- **THEN** a new column appears to the right showing that folder's contents

#### Scenario: Column selection
- **WHEN** user clicks on an item in an earlier column
- **THEN** columns to the right of the selection are removed and replaced with the new selection's contents

#### Scenario: Horizontal scroll
- **WHEN** navigation depth exceeds visible columns AND columns are not compacted
- **THEN** the column container scrolls horizontally to show the latest column

#### Scenario: Deep navigation compaction
- **WHEN** navigation depth exceeds the compaction threshold
- **THEN** middle columns are compacted to keep first and last columns visible without horizontal scrolling

### Requirement: Folder synthesis from prefixes
The system SHALL synthesize a folder structure from S3 object key prefixes.

#### Scenario: Folder display
- **WHEN** objects exist with common prefixes (e.g., `images/a.png`, `images/b.png`)
- **THEN** the system displays `images/` as a navigable folder

#### Scenario: Mixed contents
- **WHEN** a prefix level contains both "folders" (common prefixes) and files
- **THEN** both are displayed in the same column with folders listed first

### Requirement: Paginated listing
The system SHALL handle large directories through pagination.

#### Scenario: Large directory
- **WHEN** a folder contains more than 1000 objects
- **THEN** the system loads additional pages as the user scrolls (infinite scroll)

#### Scenario: Loading indicator
- **WHEN** loading more items
- **THEN** a loading indicator is shown at the bottom of the column

### Requirement: File and folder icons
The system SHALL display appropriate icons for files and folders.

#### Scenario: Folder icon
- **WHEN** displaying a folder (common prefix)
- **THEN** a folder icon is shown

#### Scenario: File icon by type
- **WHEN** displaying a file
- **THEN** an icon appropriate to the file extension is shown (image, text, generic)

### Requirement: File metadata display
The system SHALL display basic metadata for files in the column listing.

#### Scenario: File size
- **WHEN** displaying a file in a column
- **THEN** the file size is shown in human-readable format (KB, MB, GB)

#### Scenario: Last modified
- **WHEN** user hovers over or selects a file
- **THEN** the last modified date is visible

### Requirement: Breadcrumb path display
The system SHALL display the current path as a breadcrumb above the columns.

#### Scenario: Breadcrumb navigation
- **WHEN** user clicks on a breadcrumb segment
- **THEN** navigation jumps to that level, removing deeper columns

#### Scenario: Root breadcrumb
- **WHEN** user clicks the bucket name in breadcrumbs
- **THEN** navigation returns to the root level

### Requirement: Connection status indicator
The system SHALL indicate the connection status for each open bucket tab.

#### Scenario: Connected state
- **WHEN** bucket is accessible
- **THEN** a green indicator or normal state is shown

#### Scenario: Error state
- **WHEN** bucket access fails (permissions, network)
- **THEN** an error indicator is shown with the ability to view details

### Requirement: Preview panel positioning
The preview panel SHALL remain fixed to the right edge of the browser view at all times, regardless of column scroll position.

#### Scenario: Scrolling columns does not move preview
- **WHEN** user scrolls the columns area horizontally
- **THEN** the preview panel SHALL remain stationary at the right edge

### Requirement: Column horizontal scrolling
The columns area SHALL scroll horizontally to accommodate deep folder navigation, while keeping the last column visible.

#### Scenario: Navigate to deep folder
- **WHEN** user navigates into a folder causing more columns than fit the view
- **THEN** columns SHALL scroll horizontally to show the newest column
- **AND** preview panel SHALL remain fixed right

### Requirement: Empty preview state
When no file is selected, the preview panel SHALL display a clear "No preview available" message.

#### Scenario: No file selected
- **WHEN** no file is currently selected (only folders navigated)
- **THEN** preview panel SHALL show "Select a file to preview"