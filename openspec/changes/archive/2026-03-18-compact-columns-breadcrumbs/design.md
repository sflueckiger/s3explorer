## Context

The S3 Explorer uses a Finder-style column browser (`ColumnBrowser.tsx`) where each folder level adds a new 256px column to the right. When users navigate deep folder hierarchies (5+ levels), the horizontal space fills with columns and auto-scrolls to show the rightmost columns, hiding the root context.

Currently:
- Columns render in a `flex` container with `min-w-max` for unlimited horizontal growth
- Auto-scroll to rightmost column on navigation
- Breadcrumbs above show the full path but require clicking to navigate

Users navigating deep hierarchies lose visual context of where they started (root column) while working with current folders.

## Goals / Non-Goals

**Goals:**
- Keep first column (root) always visible for context
- Keep last 2 columns always visible for current working area
- Compact middle columns into a single "..." indicator when space is constrained
- Allow users to expand compacted columns temporarily
- Maintain all existing functionality (selection, navigation, scrolling)

**Non-Goals:**
- Changing the breadcrumb navigation behavior
- Making compaction user-configurable (threshold settings)
- Persisting expanded/collapsed state across sessions
- Responsive breakpoint handling (mobile layouts)

## Decisions

### 1. Compaction trigger: Column count threshold

**Decision**: Compact when there are more than 4 columns visible.

**Rationale**: With 4 columns at 256px each = 1024px, plus preview panel (320px), we hit ~1344px. Most screens can accommodate this. Beyond 4 columns, compaction provides value.

**Alternatives considered**:
- Container width measurement: More accurate but adds resize observer complexity
- User preference: Adds settings overhead for minimal benefit

### 2. Compaction display: Visual indicator column

**Decision**: Replace middle columns with a single narrow "pill" showing `...` and the count of hidden columns (e.g., `... 3`).

**Rationale**: The "..." notation is universally understood as "more content here". Including the count helps users understand the depth. A pill/button shape makes it clearly interactive.

**Visual design**:
- Width: ~48px (much narrower than regular 256px columns)
- Centered content: `⋯` (horizontal ellipsis) + count
- Muted background to distinguish from active columns
- Hover state to indicate interactivity

### 3. Expand behavior: Temporary overlay expansion

**Decision**: Clicking the compact indicator expands hidden columns as an overlay/popover that collapses on click-outside or selection.

**Rationale**:
- Temporary expansion preserves screen real estate
- Users typically expand to verify path or navigate, then continue working
- Overlay prevents layout shift in the main view

**Alternatives considered**:
- Permanent toggle: Would reintroduce the original space problem
- Inline expansion with animation: Complex and causes layout shift

### 4. State management: Component-local state

**Decision**: Manage compaction state within `ColumnBrowser.tsx` using existing React state patterns.

**Rationale**: Compaction is a UI display concern, not application state. No need for context or global state.

**State additions**:
- `isExpanded: boolean` - Whether compact indicator is expanded
- Derived: `visibleColumns`, `hiddenColumns` computed from `columns` array

### 5. Column visibility calculation

**Decision**: Fixed rule - show columns[0] + compact indicator + columns[n-2] + columns[n-1]

**Rationale**: Simple, predictable behavior. First column provides root context, last 2 provide working context and selection target.

## Risks / Trade-offs

**[Risk] Loss of intermediate context** → Mitigation: Breadcrumbs always show full path; expand button provides quick access

**[Risk] Expand overlay complexity** → Mitigation: Start with simple implementation; can enhance with animation later

**[Trade-off] Fixed threshold vs. dynamic** → Accepted: Simpler implementation; 4-column threshold works for common screen sizes

**[Trade-off] Temporary vs. permanent expansion** → Accepted: Temporary expansion may frustrate users who want to browse expanded; but permanent expansion defeats the feature purpose
