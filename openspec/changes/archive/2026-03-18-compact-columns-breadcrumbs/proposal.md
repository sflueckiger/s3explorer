## Why

When navigating deep folder hierarchies in the column browser, the horizontal space becomes consumed by many intermediate columns, making it harder to see both the context (root) and the current working area (recent selections). Users need a way to focus on relevant columns while maintaining awareness of the full path.

## What Changes

- Add automatic column compaction when navigation depth exceeds visible space
- Display first column (root) and last 2 columns (current context) always visible
- Replace middle columns with a compact "..." indicator that shows the count of hidden columns
- Make the compacted indicator expandable to temporarily reveal hidden columns
- Maintain full path visibility in the breadcrumb navigation above

## Capabilities

### New Capabilities

- `column-compaction`: Automatic compaction of middle columns in the Finder-style browser, showing first column + "..." + last 2 columns with expand-on-demand behavior

### Modified Capabilities

- `bucket-browsing`: The column-based file browser requirement is extended with compaction behavior for deep navigation

## Impact

- **Frontend components**: `ColumnBrowser.tsx` will need significant updates to handle column visibility state and compaction logic
- **UI additions**: New compact indicator component with expand/collapse behavior
- **User interaction**: Changes to horizontal scrolling behavior when columns are compacted
- **No backend changes required**: This is purely a frontend display optimization
