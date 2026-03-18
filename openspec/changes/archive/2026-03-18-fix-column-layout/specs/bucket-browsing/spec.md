## MODIFIED Requirements

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
