## Context

The application has a sidebar (`ConnectionSidebar`) that displays credential file groups and their connections. The main layout in `MainApp` uses `h-screen flex` with the sidebar having `w-64 h-full`. The sidebar already contains a `ScrollArea` component wrapping the connection list, but the current implementation may not properly isolate sidebar scrolling from main content scrolling when content overflows.

Current structure:
```
MainApp (h-screen flex)
├── ConnectionSidebar (w-64 h-full flex flex-col)
│   ├── Header (p-4 border-b) - fixed
│   ├── ScrollArea (flex-1) - should scroll
│   └── Settings footer (p-2 border-t) - fixed
└── Main content (flex-1 flex flex-col)
    └── BucketTabs
```

## Goals / Non-Goals

**Goals:**
- Sidebar connection list scrolls independently of main content
- Sidebar header and settings footer remain fixed/visible at all times
- Main content area has its own independent scroll context
- Maintain existing visual appearance and functionality

**Non-Goals:**
- Changing sidebar width or responsive behavior
- Adding new scrolling features (e.g., scroll-to-top button)
- Modifying the main content scrolling behavior beyond ensuring independence

## Decisions

### 1. Use overflow-hidden on parent flex container

**Decision**: Add `overflow-hidden` to the main `h-screen flex` container to establish a containing block that prevents content from expanding beyond viewport.

**Rationale**: This ensures both sidebar and main content respect the viewport height constraint and manage their own overflow independently.

### 2. Ensure sidebar uses proper flex structure

**Decision**: Verify sidebar uses `h-full flex flex-col overflow-hidden` with `ScrollArea` having `flex-1 min-h-0`.

**Rationale**: The `min-h-0` is critical in flex contexts to allow flex children to shrink below their content size, enabling the ScrollArea to properly constrain and scroll its content. Without `min-h-0`, flex items default to `min-height: auto` which can prevent scrolling.

### 3. Main content should also constrain overflow

**Decision**: Ensure main content area (`flex-1 flex flex-col`) also has `overflow-hidden` or `min-h-0` to properly manage its internal scrolling.

**Rationale**: Consistent overflow handling across both panels ensures they scroll independently.

## Risks / Trade-offs

**Risk**: Adding overflow-hidden could clip shadows or positioned elements unexpectedly.
→ **Mitigation**: Test with dropdowns, dialogs, and tooltips to ensure they still render correctly (they use portals, so should be unaffected).

**Risk**: The `min-h-0` fix is subtle and could be inadvertently removed.
→ **Mitigation**: Add a brief code comment explaining its purpose.
