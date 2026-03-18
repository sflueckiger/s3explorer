## 1. Fix Layout Structure

- [x] 1.1 Refactor ColumnBrowser to separate columns scroll area from preview panel
- [x] 1.2 Make columns area scrollable with overflow-x-auto
- [x] 1.3 Make preview panel fixed width outside scroll area (flex-shrink-0)

## 2. Auto-scroll Behavior

- [x] 2.1 Implement auto-scroll to rightmost column when new column loads
- [x] 2.2 Ensure scroll happens after column renders (useEffect with proper deps)

## 3. Empty State

- [x] 3.1 Update PreviewPanel empty state message to "Select a file to preview"

## 4. Cleanup

- [x] 4.1 Remove any code creating empty placeholder columns
- [x] 4.2 Verify compaction still works with new layout

## 5. Verification

- [x] 5.1 Test deep folder navigation - preview stays right
- [x] 5.2 Test column scrolling - last column always visible
- [x] 5.3 Build succeeds
