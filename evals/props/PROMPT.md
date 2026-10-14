Create a Svelte 5 component that uses the `$props` rune to accept component properties.

The component should accept props for `name` (default "World"), `count` (default 0), and `showDetails` (default false). Display the name in a heading, show the count with an increment button, and conditionally display details when `showDetails` is true.

- The heading has `data-testid="name-display"`
- The count is shown in an element with `data-testid="count-display"`; the `count` prop is the initial value and the button with `data-testid="increment-button"` increases it by 1
- The details are in an element with `data-testid="details"` that is only rendered when `showDetails` is true; it shows the current values of `name`, `count` and `showDetails` (e.g. "Name: Svelte", "Count: 5", "Show details: true")

Create the component in `src/routes/+page.svelte` without importing other components
