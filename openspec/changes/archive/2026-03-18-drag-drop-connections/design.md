## Context

The S3 Explorer has a sidebar with connection groups (encrypted credential files) containing multiple connections. Currently connections are displayed in insertion order with no way to reorganize them. Users want to reorder connections within a group and move connections between groups.

The frontend uses React with TypeScript and the backend uses Elysia (Bun). Connections are stored in encrypted config files (AES-256-GCM) per group.

## Goals / Non-Goals

**Goals:**
- Enable drag & drop reordering of connections within the same group
- Enable drag & drop to move connections between groups
- Require password unlock when dropping onto a locked group
- Show confirmation when moving between groups (destructive operation)
- Persist connection order in config files

**Non-Goals:**
- Keyboard-based reordering (future enhancement)
- Drag & drop of entire connection groups
- Undo/redo for moves

## Decisions

### 1. Drag & Drop Library: @dnd-kit/core

**Rationale**: @dnd-kit is a modern, lightweight, React-first drag & drop library with excellent TypeScript support. It's more flexible than react-beautiful-dnd and has better accessibility support.

**Alternatives considered**:
- react-beautiful-dnd: Larger bundle, less actively maintained
- Native HTML5 drag & drop: Poor cross-browser UX, limited customization

### 2. Reorder API: PUT /connections/reorder

**Rationale**: Single endpoint that accepts the new order of connection IDs for a group. Server validates all IDs belong to the group and updates the array order in the config file.

**Request format**:
```typescript
{ configPath: string, connectionIds: string[] }
```

### 3. Move API: POST /connections/move

**Rationale**: Separate endpoint for cross-group moves since it involves two config files and needs atomic operation. The endpoint handles removing from source and adding to target.

**Request format**:
```typescript
{
  connectionId: string,
  sourceConfigPath: string,
  targetConfigPath: string,
  targetIndex?: number  // optional, defaults to end
}
```

### 4. Move Confirmation Dialog

**Rationale**: Moving between groups is destructive (removes from source file, adds to target). A confirmation dialog prevents accidental moves and explains what will happen.

**UX flow**:
1. User drags connection over different group
2. Drop triggers confirmation dialog
3. Dialog explains: "Move [name] from [source group] to [target group]? This will remove the connection from the source credential file."
4. If target is locked, dialog shows password field first
5. On confirm, call move API

### 5. Visual Feedback During Drag

**Rationale**: Clear visual feedback helps users understand what will happen.

- Dragged item: Slightly elevated with shadow, reduced opacity on original position
- Valid drop zone: Subtle highlight on group header
- Drop indicator: Line showing where item will be inserted

## Risks / Trade-offs

**[Risk]** Move operation fails mid-way (removed from source but not added to target)
→ **Mitigation**: Server implements as single transaction - read both files, modify in memory, write both atomically. If either write fails, neither is committed.

**[Risk]** User accidentally moves connection to wrong group
→ **Mitigation**: Confirmation dialog with clear group names shown. User can immediately move it back.

**[Trade-off]** Using @dnd-kit adds ~15KB to bundle
→ **Acceptable**: The UX benefit outweighs the small bundle increase. Alternative of building from scratch would be more code and less accessible.
