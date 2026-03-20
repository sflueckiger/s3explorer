## MODIFIED Requirements

### Requirement: Preview panel display
The system SHALL display a preview panel on the right side of the column browser when a file is selected.

#### Scenario: Panel visibility
- **WHEN** user selects a file in any column
- **THEN** the preview panel appears showing the file preview or metadata

#### Scenario: No selection
- **WHEN** no file is selected (only folders selected or nothing)
- **THEN** the preview panel shows a placeholder or is hidden

#### Scenario: Video file selected
- **WHEN** user selects a video file (mp4, webm)
- **THEN** the preview panel displays a video player
