## 1. Fix Main Layout Container

- [x] 1.1 Add `overflow-hidden` to the root flex container in MainApp.tsx to establish scroll containment

## 2. Fix Sidebar Layout

- [x] 2.1 Add `overflow-hidden` to ConnectionSidebar root container to prevent content expansion
- [x] 2.2 Add `min-h-0` to ScrollArea to allow flex shrinking below content size
- [x] 2.3 Verify header and footer remain fixed while connection list scrolls

## 3. Testing

- [x] 3.1 Test with multiple credential files containing many connections
- [x] 3.2 Verify sidebar scrolls independently from main content
- [x] 3.3 Verify dropdowns and dialogs still render correctly (not clipped)
