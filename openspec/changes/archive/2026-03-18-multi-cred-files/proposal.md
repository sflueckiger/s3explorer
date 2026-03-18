## Why

Users need to manage connections across multiple credential files - for example, separate files for personal vs work accounts, or different projects. Currently the app only supports a single credential file, forcing users to manually switch or maintain separate installations.

## What Changes

- Support multiple credential files open simultaneously in the same session
- Group sidebar connections by their source credential file with visual separation
- Show credential file path as a subtle header for each group
- Allow adding connections directly to a specific credential file
- Cache known credential file paths in localStorage for quick access
- Support unlocking/locking individual credential files independently

## Capabilities

### New Capabilities
- `multi-file-session`: Managing multiple credential files in a single session with independent unlock/lock states

### Modified Capabilities
- `credential-management`: Extend to support multiple concurrent credential files instead of single file
- `connection-management`: Connections now belong to a specific credential file; UI groups by file

## Impact

- **Backend**: Session service needs to track multiple configs with separate unlock states
- **Frontend**: ConnectionSidebar needs grouping UI with file headers and per-file add buttons
- **State**: localStorage caches known credential file paths
- **API**: Auth endpoints need to specify which config file to operate on
