## 1. Compaction State Management

- [x] 1.1 Add `isExpanded` state to ColumnBrowser component for tracking compact indicator expansion
- [x] 1.2 Create `useColumnCompaction` hook or helper function to compute visible/hidden columns based on threshold (>4 columns)
- [x] 1.3 Add derived state for `visibleColumns` (first + last 2) and `hiddenColumns` (middle columns)

## 2. Compact Indicator Component

- [x] 2.1 Create `CompactIndicator` component with ellipsis (⋯) and hidden column count display
- [x] 2.2 Style compact indicator with narrow width (~48px), muted background, and hover state
- [x] 2.3 Add click handler to toggle expanded state

## 3. Column Layout Updates

- [x] 3.1 Update column rendering loop to conditionally show compact indicator between first and last 2 columns
- [x] 3.2 Ensure first column renders at full width when compacted
- [x] 3.3 Ensure last two columns render at full width when compacted

## 4. Expanded View Implementation

- [x] 4.1 Create expanded view overlay/popover for hidden columns when indicator is clicked
- [x] 4.2 Position expanded view correctly relative to compact indicator
- [x] 4.3 Implement click-outside detection to collapse expanded view
- [x] 4.4 Collapse expanded view automatically when user selects an item

## 5. Navigation Integration

- [x] 5.1 Update folder selection handler to recalculate compaction after navigation
- [x] 5.2 Update file selection handler to collapse expanded view and recalculate compaction
- [x] 5.3 Update breadcrumb click handler to adjust compaction for new column count
- [x] 5.4 Disable auto-scroll to rightmost column when columns are compacted (not needed)

## 6. Testing and Polish

- [x] 6.1 Test compaction trigger at exactly 5 columns (threshold boundary)
- [x] 6.2 Test navigation in/out of compacted state
- [x] 6.3 Test expand/collapse behavior with click-outside
- [x] 6.4 Verify breadcrumb navigation works correctly with compaction
