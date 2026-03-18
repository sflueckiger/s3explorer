## ADDED Requirements

### Requirement: Automatic column compaction
The system SHALL automatically compact middle columns when navigation depth exceeds the visible threshold, showing only the first column and the last two columns.

#### Scenario: Compaction triggers at threshold
- **WHEN** the user navigates to a depth of more than 4 columns
- **THEN** the middle columns are replaced with a compact indicator showing "..." and the count of hidden columns

#### Scenario: Compaction does not trigger below threshold
- **WHEN** the user has 4 or fewer columns visible
- **THEN** all columns are displayed normally without compaction

#### Scenario: First column always visible
- **WHEN** columns are compacted
- **THEN** the first column (root level) remains fully visible

#### Scenario: Last two columns always visible
- **WHEN** columns are compacted
- **THEN** the last two columns remain fully visible for current context

### Requirement: Compact indicator display
The system SHALL display a visually distinct compact indicator in place of hidden columns.

#### Scenario: Indicator appearance
- **WHEN** columns are compacted
- **THEN** the indicator displays a horizontal ellipsis (⋯) with the count of hidden columns

#### Scenario: Indicator width
- **WHEN** the compact indicator is displayed
- **THEN** it is significantly narrower than regular columns to save space

#### Scenario: Indicator visual distinction
- **WHEN** the compact indicator is displayed
- **THEN** it has a muted background and styling that distinguishes it from navigable columns

#### Scenario: Indicator hover state
- **WHEN** the user hovers over the compact indicator
- **THEN** a visual hover state indicates the indicator is interactive

### Requirement: Expand hidden columns
The system SHALL allow users to temporarily expand hidden columns to view their contents.

#### Scenario: Click to expand
- **WHEN** the user clicks the compact indicator
- **THEN** the hidden columns are displayed as an overlay/expanded view

#### Scenario: Expanded view shows all hidden columns
- **WHEN** the compact indicator is expanded
- **THEN** all previously hidden middle columns are visible with their full contents

#### Scenario: Collapse on outside click
- **WHEN** the hidden columns are expanded AND the user clicks outside the expanded area
- **THEN** the expanded view collapses back to the compact indicator

#### Scenario: Collapse on selection
- **WHEN** the hidden columns are expanded AND the user selects an item in any column
- **THEN** the expanded view collapses and navigation proceeds normally

### Requirement: Navigation while compacted
The system SHALL maintain full navigation functionality when columns are compacted.

#### Scenario: Select folder in visible column
- **WHEN** columns are compacted AND the user clicks a folder in a visible column
- **THEN** navigation works normally and compaction adjusts to the new column count

#### Scenario: Select item in expanded view
- **WHEN** hidden columns are expanded AND the user clicks an item
- **THEN** navigation proceeds from that item and the view re-compacts appropriately

#### Scenario: Breadcrumb navigation
- **WHEN** columns are compacted AND the user clicks a breadcrumb segment
- **THEN** navigation jumps to that level and compaction adjusts accordingly
