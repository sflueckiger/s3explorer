## Context

Current layout structure:
```
[Sidebar 256px] | [Columns (flex, scrollable)] + [PreviewPanel 320px]
```

The columns + preview are in a single flex container with `min-w-max`, causing the preview to move when columns overflow.

## Goals / Non-Goals

**Goals:**
- Preview panel fixed to right edge at all times
- Columns area scrolls independently, preview doesn't move
- Last column always visible (auto-scroll on navigation)
- Clean empty state in preview panel

**Non-Goals:**
- Changing column width or compaction logic
- Changing the sidebar behavior

## Decisions

### Layout structure change
New structure:
```
[Sidebar] | [ColumnBrowser area]
                ├── [Columns container - scrollable horizontally]
                └── [PreviewPanel - fixed right, outside scroll container]
```

The columns container scrolls independently while preview panel is positioned absolutely or with flex-shrink-0 outside the scroll area.

### Implementation approach
Use CSS positioning:
- Outer container: `flex` with columns area + preview
- Columns area: `flex-1 overflow-x-auto` - scrolls horizontally
- Preview panel: `flex-shrink-0 w-80` - never scrolls, stays right

### Auto-scroll behavior
After loading a new column, scroll the columns container to show the rightmost column. Use `scrollLeft = scrollWidth - clientWidth` or smooth scroll to end.

## Risks / Trade-offs

**[Risk] Column compaction interacts with scroll** → Need to ensure compaction still works correctly when columns expand from compact state.
