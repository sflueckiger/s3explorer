## Why

When many connections are present in the sidebar, the list can exceed the viewport height. Currently, while the sidebar has a ScrollArea, the overall layout may not properly constrain the sidebar to allow independent scrolling from the main content area.

## What Changes

- Ensure the sidebar scrolls independently from the main content area
- The sidebar should remain fixed height (viewport height) with its connection list scrollable
- The main content area should have its own independent scroll context
- Header and settings footer in the sidebar should remain fixed while connections scroll

## Capabilities

### New Capabilities

None - this is a CSS/layout fix to existing components.

### Modified Capabilities

None - no spec-level behavior changes, only layout/styling adjustments.

## Impact

- `packages/frontend/src/components/ConnectionSidebar.tsx` - layout structure adjustments
- `packages/frontend/src/components/MainApp.tsx` - may need flex container adjustments
- No API changes
- No breaking changes
