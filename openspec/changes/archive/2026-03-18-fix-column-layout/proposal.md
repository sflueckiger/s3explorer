## Why

The current column browser layout has issues:
1. Preview panel is not fixed to the right edge - it moves with columns
2. Empty columns appear in some cases (visible in screenshot)
3. When many columns are open, the rightmost content may scroll out of view
4. When no file is selected, the preview panel shows a generic message instead of clear "No preview available"

## What Changes

- Fix preview panel to right edge of viewport (sticky/fixed positioning)
- Columns scroll horizontally behind the sidebar, preview panel stays fixed right
- Auto-scroll to keep the last (deepest) column visible
- Show "No preview available" when no file is selected
- Remove any empty/placeholder columns

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `bucket-browsing`: Layout behavior change for preview panel and column scrolling

## Impact

- `packages/frontend/src/components/ColumnBrowser.tsx`: Major layout refactor
- `packages/frontend/src/components/PreviewPanel.tsx`: Update empty state message
- `packages/frontend/src/components/MainApp.tsx`: May need adjustment for scroll container
