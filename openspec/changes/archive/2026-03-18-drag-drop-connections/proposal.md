## Why

Users currently cannot reorder connections within a group or move connections between groups. This limits organizational flexibility, especially as the number of connections grows. Drag & drop provides an intuitive way to reorganize connections.

## What Changes

- Add drag & drop capability to connection items in the sidebar
- Allow reordering connections within the same connection group
- Allow moving connections from one group to another via drag & drop
- When dropping on a locked group, prompt for password to unlock it first
- Show confirmation dialog when moving between groups (explains this removes from source and adds to target)
- Persist connection order in the encrypted config files

## Capabilities

### New Capabilities
- `drag-drop-reorder`: Drag & drop infrastructure for reordering and moving connections between groups

### Modified Capabilities
- `connection-management`: Add reorder endpoint and move endpoint to connection CRUD operations

## Impact

- **Frontend**: Add drag & drop library (dnd-kit or similar), update CredentialFileGroup component, add move confirmation dialog
- **Backend**: Add PUT /connections/reorder and POST /connections/move endpoints
- **Config**: Connection order will be persisted (array order in config determines display order)
