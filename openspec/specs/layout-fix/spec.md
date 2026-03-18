### Requirement: Independent sidebar scrolling

The sidebar connection list SHALL scroll independently from the main content area. When the connection list exceeds the available viewport height, users MUST be able to scroll within the sidebar without affecting the main content scroll position.

#### Scenario: Sidebar scrolls independently with many connections
- **WHEN** the sidebar contains more connections than fit in the viewport
- **THEN** the sidebar connection list is scrollable
- **AND** scrolling the sidebar does not scroll the main content area

#### Scenario: Sidebar header and footer remain fixed
- **WHEN** the user scrolls the sidebar connection list
- **THEN** the sidebar header ("S3 Explorer") remains visible at the top
- **AND** the settings menu remains visible at the bottom
