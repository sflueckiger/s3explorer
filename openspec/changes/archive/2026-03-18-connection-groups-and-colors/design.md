## Context

The S3 Explorer currently supports multiple credential files, each containing S3 connections. In the sidebar, credential files are identified only by their file path (e.g., `~/.s3explore/config.enc`), which is not user-friendly. Connections within each file have no visual differentiation.

Users want:
1. Friendly names for credential files (e.g., "Work", "Personal")
2. Visual color indicators for individual connections

## Goals / Non-Goals

**Goals:**
- Add naming to credential files, displayed as "Connection Groups"
- Add color selection to connections with 10 predefined colors
- Show color indicators in the sidebar connection list
- Maintain backwards compatibility with existing credential files

**Non-Goals:**
- Custom colors beyond the 10 predefined options
- Grouping connections within a single credential file
- Connection sorting or filtering by color

## Decisions

### 1. Group name storage location

**Decision**: Store the group name inside the encrypted credential file alongside connections.

**Rationale**: Keeps all user data encrypted. The config structure becomes `{ name?: string, connections: [...] }`.

**Alternative considered**: Store names in a separate unencrypted metadata file. Rejected because it splits user preferences and requires syncing.

### 2. Connection color storage

**Decision**: Add optional `color` field to Connection type storing the color key (e.g., "powder-blush", "thistle").

**Rationale**: Store the key rather than hex value to allow future theme adjustments. Colors defined as constants in frontend code.

**Alternative considered**: Store hex values directly. Rejected for flexibility reasons.

### 3. Predefined color palette

**Decision**: Use exactly these 10 colors with CSS variable-style names:
- powder-blush: #ffac92
- cotton-rose: #e8b5b6
- peach-glow: #ffcd9e
- thistle: #d3c1e7
- pink-orchid: #e7c0eb
- frozen-water: #d2fffa
- lemon-chiffon: #fff9be
- tea-green: #c4ffdf
- lavender: #d3d3e0
- light-cyan: #caf6fc

**Rationale**: Pastel colors that work well as small indicators without being too bold. User-specified palette.

### 4. Color picker UI

**Decision**: Horizontal row of colored circles. Selected color shows a checkmark inside. No color option shows as a transparent/bordered circle.

**Rationale**: Compact, visually clear, and matches common UI patterns (e.g., label colors in issue trackers).

### 5. Default values

**Decision**:
- Group name defaults to the filename (e.g., "config" from "config.enc")
- Connection color defaults to undefined (no color indicator shown)

**Rationale**: Provides sensible defaults without forcing user input.

## Risks / Trade-offs

**Risk**: Existing credential files don't have a name field.
→ **Mitigation**: Treat undefined name as fallback to filename. No migration needed.

**Risk**: Color names might conflict with future CSS variables.
→ **Mitigation**: Use descriptive names (powder-blush, not --color-1). Colors defined as TypeScript constants.

**Trade-off**: Storing color as key vs hex limits flexibility but improves consistency.
→ Acceptable for this use case; 10 colors is sufficient for visual differentiation.
