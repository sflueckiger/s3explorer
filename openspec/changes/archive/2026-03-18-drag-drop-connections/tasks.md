## 1. Dependencies & Setup

- [x] 1.1 Install @dnd-kit/core and @dnd-kit/sortable packages
- [x] 1.2 Create DndProvider wrapper component with DndContext

## 2. Backend: Reorder API

- [x] 2.1 Add PUT /connections/reorder endpoint schema to types.ts
- [x] 2.2 Implement reorder handler: validate IDs, update config order, save
- [x] 2.3 Add error handling for invalid IDs and locked config

## 3. Backend: Move API

- [x] 3.1 Add POST /connections/move endpoint schema to types.ts
- [x] 3.2 Implement move handler: validate source/target unlocked
- [x] 3.3 Implement atomic move: read both configs, transfer connection, write both
- [x] 3.4 Support optional targetIndex for insertion position
- [x] 3.5 Add error handling for connection not found, locked configs

## 4. Frontend: Draggable Connection Item

- [x] 4.1 Create DraggableConnection component wrapping connection item
- [x] 4.2 Add useSortable hook for drag handle and transform styles
- [x] 4.3 Add visual feedback: elevation, opacity, cursor styles during drag

## 5. Frontend: Droppable Group Container

- [x] 5.1 Create DroppableGroup component wrapping CredentialFileGroup
- [x] 5.2 Add useDroppable hook for drop zone detection
- [x] 5.3 Add visual feedback: highlight group on drag over

## 6. Frontend: Sortable List Within Group

- [x] 6.1 Wrap connections list with SortableContext
- [x] 6.2 Implement onDragEnd handler for same-group reorder
- [x] 6.3 Call PUT /connections/reorder API on drop
- [x] 6.4 Update local state optimistically, rollback on error

## 7. Frontend: Move Confirmation Dialog

- [x] 7.1 Create MoveConnectionDialog component
- [x] 7.2 Display connection name, source group, target group
- [x] 7.3 Add warning text explaining remove from source, add to target
- [x] 7.4 Add Cancel and Move buttons

## 8. Frontend: Cross-Group Move Flow

- [x] 8.1 Detect drop on different group in onDragEnd
- [x] 8.2 Check if target group is locked
- [x] 8.3 Show unlock dialog if target locked, then show move confirmation
- [x] 8.4 Call POST /connections/move API on confirm
- [x] 8.5 Update local state: remove from source, add to target
- [x] 8.6 Handle errors and show toast feedback

## 9. Frontend: Drop Indicator

- [x] 9.1 Add DragOverlay for floating preview during drag
- [x] 9.2 Add visual drop indicator line between items

## 10. Integration & Polish

- [x] 10.1 Wire up DndProvider in ConnectionSidebar
- [x] 10.2 Test reorder within group persists across reload
- [x] 10.3 Test move between groups with locked/unlocked groups
- [x] 10.4 Ensure tabs for moved connections stay open
