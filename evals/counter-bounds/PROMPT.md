Create a Svelte 5 counter with:

- Props: `initialValue` (number, default `0`), `min` (number, optional, default no lower bound), `max` (number, optional, default no upper bound)
- Buttons: increment (+1), decrement (-1), reset (sets the count back to `initialValue`)
- Disable buttons at bounds: increment is `disabled` when the count is at `max`, decrement is `disabled` when the count is at `min`; with no `min`/`max` neither is disabled
- The count starts at `initialValue`; if the `initialValue` prop later changes, the count is set to the new `initialValue`
- `data-testid` attributes: `count-value` on the element displaying the count (text is just the number), `increment-button`, `decrement-button` and `reset-button` on the buttons

Create the component in `src/routes/+page.svelte` without importing other components
