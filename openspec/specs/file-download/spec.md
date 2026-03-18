## ADDED Requirements

### Requirement: Single file download
The system SHALL allow users to download individual files from S3 to their local machine.

#### Scenario: Download button in preview
- **WHEN** a file is selected in the browser
- **THEN** a download button is visible in the preview panel

#### Scenario: Download initiation
- **WHEN** user clicks the download button
- **THEN** the browser's native download dialog appears with the original filename

#### Scenario: Content-Disposition header
- **WHEN** serving a file for download
- **THEN** the response includes `Content-Disposition: attachment; filename="<original-name>"`

### Requirement: Download from column
The system SHALL allow users to download files directly from the column listing.

#### Scenario: Context action
- **WHEN** user right-clicks or uses a menu on a file in a column
- **THEN** a "Download" option is available

#### Scenario: Direct download
- **WHEN** user selects download from column
- **THEN** the file downloads without needing to open preview first

### Requirement: Download progress indication
The system SHALL indicate download progress for large files.

#### Scenario: Progress feedback
- **WHEN** downloading a file larger than 1MB
- **THEN** the UI indicates the download is in progress

#### Scenario: Download complete
- **WHEN** download finishes
- **THEN** a success notification is shown

### Requirement: Streaming download
The system SHALL stream file downloads to avoid loading entire files into memory.

#### Scenario: Large file handling
- **WHEN** downloading a file of any size
- **THEN** the backend streams bytes directly from S3 to the client response

#### Scenario: Memory efficiency
- **WHEN** multiple downloads are in progress
- **THEN** each download streams without buffering the entire file in memory

### Requirement: Download error handling
The system SHALL handle download failures gracefully.

#### Scenario: Network error
- **WHEN** download fails due to network issues
- **THEN** an error notification is shown with option to retry

#### Scenario: Access denied
- **WHEN** download fails due to S3 permissions
- **THEN** an error message indicates the access issue

### Requirement: Preserve original filename
The system SHALL use the original S3 object key filename for downloads.

#### Scenario: Simple filename
- **WHEN** downloading `images/photo.png`
- **THEN** the downloaded file is named `photo.png`

#### Scenario: Special characters
- **WHEN** filename contains special characters
- **THEN** the filename is properly encoded in the Content-Disposition header
