Create a Svelte 5 counter component with increment and decrement functionality.

Use Svelte 5's `$state` rune for reactivity. The component should have increment/decrement buttons and display the current count starting at 0. The count can go below 0.

Use these `data-testid` attributes:

- `count-value`: the element displaying the current count (its text is just the number, e.g. `0` or `-1`)
- `increment-button`: the button that increases the count by 1
- `decrement-button`: the button that decreases the count by 1

Create the component in `src/routes/+page.svelte` without importing other components
