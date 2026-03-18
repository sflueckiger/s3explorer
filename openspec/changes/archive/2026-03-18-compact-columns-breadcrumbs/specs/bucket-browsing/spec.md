## MODIFIED Requirements

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
