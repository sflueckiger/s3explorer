## 1. Backend - Config & Types

- [ ] 1.1 Add `name` field to Config type (optional string for group name)
- [ ] 1.2 Add `color` field to Connection type (optional string for color key)
- [ ] 1.3 Update writeConfig to include name field when serializing
- [ ] 1.4 Update readConfig to parse name field (default to undefined if missing)

## 2. Backend - Auth Routes

- [ ] 2.1 Update POST /auth/setup to accept optional `name` parameter
- [ ] 2.2 Update GET /auth/status to return group name for each config
- [ ] 2.3 Add POST /auth/rename endpoint to rename a connection group
- [ ] 2.4 Update GET /auth/file-status to return group name if available

## 3. Backend - Connection Routes

- [ ] 3.1 Update POST /connections to accept optional `color` parameter
- [ ] 3.2 Update PUT /connections/:id to accept optional `color` parameter
- [ ] 3.3 Update GET /connections to return color field in connection data

## 4. Frontend - Types & Constants

- [ ] 4.1 Add `name` field to ConfigFile type
- [ ] 4.2 Add `color` field to Connection type
- [ ] 4.3 Create COLOR_PALETTE constant with 10 color definitions (key, hex, name)

## 5. Frontend - Color Picker Component

- [ ] 5.1 Create ColorPicker component with circle swatches
- [ ] 5.2 Add checkmark indicator for selected color
- [ ] 5.3 Add "no color" option (transparent/bordered circle)
- [ ] 5.4 Handle color selection via onChange callback

## 6. Frontend - Connection Dialogs

- [ ] 6.1 Add ColorPicker to AddConnectionDialog
- [ ] 6.2 Add ColorPicker to EditConnectionDialog
- [ ] 6.3 Pass color value when creating/updating connections

## 7. Frontend - Add Credential File Dialog

- [ ] 7.1 Add "Group Name" input field to AddCredentialFileDialog
- [ ] 7.2 Update dialog to pass name to setup endpoint
- [ ] 7.3 Add placeholder text showing default name behavior

## 8. Frontend - Sidebar Display

- [ ] 8.1 Update CredentialFileGroup to display group name above path
- [ ] 8.2 Style group name prominently (larger, bolder than path)
- [ ] 8.3 Add color circle indicator before connection names in list
- [ ] 8.4 Add "Rename" option to connection group context menu

## 9. Frontend - State Management

- [ ] 9.1 Update useAuth to handle group name in status response
- [ ] 9.2 Add renameGroup action to useAuth hook
- [ ] 9.3 Update setFileConnections to preserve group name

## 10. Frontend - Rename Dialog

- [ ] 10.1 Create RenameGroupDialog component
- [ ] 10.2 Wire up rename dialog to context menu action
- [ ] 10.3 Call rename API and update state on success
