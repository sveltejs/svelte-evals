Create a Svelte 5 checklist with:

- Props: items ({id, label}[])
- One checkbox per item with `data-testid="item-checkbox"`, all unchecked initially; clicking toggles that item
- Select All checkbox with `data-testid="select-all"`: checked only when every item is selected, indeterminate when partial (not indeterminate when none or all are selected); clicking it selects all items, or deselects all when all are already selected
- Display selected count in an element with `data-testid="selected-count"`, formatted as "2 selected"

Create the component in `src/routes/+page.svelte` without importing other components
