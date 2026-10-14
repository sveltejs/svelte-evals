Create a Svelte 5 component that uses the `$inspect` rune to log and track state changes.

The component should have a text input starting with "Hello world", use basic `$inspect` to log the value, implement `$inspect(...).with` to track updates with a custom callback, and use `$inspect.trace()` inside an effect. Display the input value and character count.

- The text input has `data-testid="text-input"` and is bound to the text state
- The current text is displayed in an element with `data-testid="text-value"` as `Current text: "Hello world"`
- The character count is displayed in an element with `data-testid="char-count"` as `Character count: 11`
- The `$inspect(...).with` callback logs the event type (`init` or `update`) and the value as separate arguments, e.g. `console.log(type, value)`

Create the component in `src/routes/+page.svelte` without importing other components
