# UX Patterns

> Key interaction patterns for the Crypto Opportunities Database.

## Navigation

Single-page application — the main table view is the entire UI in v1.
- No sidebar navigation needed
- Header with app name, search bar, create button
- FilterBar sits above the table
- Filters persist in URL (shareable, bookmarkable)

## Table Interaction

### Sorting
- Click column header to sort ascending
- Click again for descending
- Visual indicator (arrow) shows current sort direction
- Server-side sorting (not client-side)

### Inline Editing
- Click a cell to enter edit mode
- Escape to cancel, blur or Enter to save
- Optimistic update: UI reflects change immediately, rollback on error
- Editable cells: name, type (dropdown), status (dropdown), organization, dates, reward_amount, website_url

### Row Expansion
- Click row to expand detail view (or open side panel)
- Shows all fields including description, links, notes, timestamps
- Type-specific labels for dates and rewards

### Column Visibility
- Dropdown toggle in table toolbar
- Users can show/hide columns to customize their view

## Forms

### Create Opportunity Dialog
- shadcn Dialog overlay
- Type selector as first required field (radio group or button group) — prominent
- Form adapts labels based on selected type:
  - Hackathon: "Prize Pool", "Event Dates"
  - Grant: "Grant Amount", "Application Deadline"
  - Fellowship: "Stipend", "Program Dates"
  - Bounty: "Bounty Reward", "Deadline"
- Zod validation with inline error messages
- Submit creates opportunity, closes dialog, shows success toast

### Delete Confirmation
- shadcn AlertDialog
- Shows opportunity name and type in confirmation message
- Confirm button is destructive (red)

## Filters

### Type Filter (Primary)
- Multi-select with colored badges per type option
- Prominent placement — first filter in the bar
- Selecting types immediately filters the table

### Other Filters
- Status: single-select dropdown
- Organization: autocomplete/combobox
- Blockchain: multi-select combobox
- Tag: multi-select combobox
- Search: text input with 300ms debounce

### Clear All
- "Clear filters" button visible when any filter is active

## Loading States

- **Initial load:** Skeleton matching table layout (rows of gray blocks)
- **Filter change:** Keep current data visible, show subtle loading indicator
- **Mutation (create/update/delete):** Optimistic UI + toast on completion

## Empty States

- **No data at all:** Illustration + "No opportunities yet" + prominent create button
- **Filtered empty:** "No [type] found matching your filters" (type-specific if type filter active)
- **Error state:** Error message + retry button

## Error Handling

- API errors shown as toast notifications (not inline)
- Validation errors shown inline on form fields
- Network errors: "Something went wrong. Try again." + retry
- Never show raw error codes or stack traces to users

## Accessibility

- Keyboard navigation for table (tab between cells, Enter to edit)
- Cmd+K to focus search
- All interactive elements have focus states
- Color is not the only indicator — type badges include text labels
- Screen reader labels on icon-only buttons
