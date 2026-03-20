## ADDED Requirements

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

### Requirement: Image preview
The system SHALL display image previews for supported image formats.

#### Scenario: Supported image formats
- **WHEN** user selects a file with extension png, jpg, jpeg, gif, webp, or svg
- **THEN** the image is displayed in the preview panel

#### Scenario: Image scaling
- **WHEN** image is larger than the preview panel
- **THEN** the image is scaled to fit while maintaining aspect ratio

#### Scenario: Image loading
- **WHEN** loading an image preview
- **THEN** a loading indicator is shown until the image loads

### Requirement: Text preview
The system SHALL display text content for supported text formats.

#### Scenario: Supported text formats
- **WHEN** user selects a file with extension txt, json, md, yaml, yml, xml, csv, or log
- **THEN** the file contents are displayed as text in the preview panel

#### Scenario: JSON formatting
- **WHEN** previewing a .json file
- **THEN** the content is displayed with syntax highlighting and proper indentation

#### Scenario: Text truncation
- **WHEN** text file exceeds 1MB
- **THEN** only the first 1MB is loaded with a notice that content is truncated

### Requirement: File metadata display
The system SHALL display file metadata in the preview panel.

#### Scenario: Metadata fields
- **WHEN** a file is selected
- **THEN** the preview shows: filename, size (human-readable), last modified date, content type

#### Scenario: Metadata for non-previewable files
- **WHEN** a file cannot be previewed (unsupported format)
- **THEN** only the metadata is displayed with a download button

### Requirement: Preview size limits
The system SHALL enforce size limits on preview content to prevent memory issues.

#### Scenario: Large image limit
- **WHEN** an image file exceeds 10MB
- **THEN** the preview shows metadata only with option to download

#### Scenario: Large text limit
- **WHEN** a text file exceeds 1MB
- **THEN** the preview shows truncated content with a notice

### Requirement: Preview error handling
The system SHALL gracefully handle preview failures.

#### Scenario: Load failure
- **WHEN** preview content fails to load (network error, access denied)
- **THEN** an error message is displayed with option to retry

#### Scenario: Unsupported format
- **WHEN** file format is not supported for preview
- **THEN** the panel shows file metadata and download button only
