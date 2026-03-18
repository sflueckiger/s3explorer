## Why

Users with multiple credential files need better visual organization. Currently, credential files only show the file path, which can be cryptic. Adding names ("Connection Groups") makes them instantly recognizable. Additionally, when managing many connections within a group, color-coding helps users quickly identify and select the right connection.

## What Changes

- Rename "credential file" concept to "Connection Group" in UI terminology
- Add a user-defined `name` field to each credential file/group (e.g., "Personal", "Work", "Production")
- Display the group name prominently above the file path in the sidebar
- Add a `color` field to individual connections with 10 predefined color options
- Show color indicator (circle) next to connection names in the sidebar
- Add color picker to connection create/edit modal (circle swatches with checkmark selection)

## Capabilities

### New Capabilities
- `connection-groups`: Adds naming capability to credential files, displayed as "Connection Groups" with name shown above file path in navigation

### Modified Capabilities
- `connection-management`: Adding color field to connection data model and color picker UI to add/edit connection forms

## Impact

- Backend: Add `name` field to credential file metadata, add `color` field to Connection type
- Frontend: Update AddCredentialFileDialog to include name field, update CredentialFileGroup to display group name, add color picker to AddConnectionDialog/EditConnectionDialog, show color circles in connection list
- API: Update auth endpoints to handle group names, update connection endpoints for color field
