Create a Svelte 5 number doubler component that uses the `$effect` rune.

The component should have a number input starting at 5, use `$effect` to calculate the doubled value whenever the number changes, and include a button to increment the number by 1.

- The current number is displayed in an element with `data-testid="number-value"` as `Number: 5`
- The doubled value is displayed in an element with `data-testid="doubled-value"` as `Doubled: 10`
- The increment button has `data-testid="increment-button"`

Create the component in `src/routes/+page.svelte` without importing other components
