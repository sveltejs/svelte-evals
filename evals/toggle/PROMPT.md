Create a Svelte 5 toggle switch with:

- Props: checked (bindable, boolean, default false), disabled (boolean, default false), label (string)
- The switch element has `data-testid="switch"`; clicking it toggles checked
- Keyboard togglable (Space/Enter) when focused
- role="switch" with aria-checked ("true"/"false") reflecting checked
- When disabled, clicking or key presses do not change checked
- The label text is rendered in a separate element with `data-testid="label"` and an `id`; the switch references it with `aria-labelledby`

Create the component in `src/routes/+page.svelte` without importing other components
