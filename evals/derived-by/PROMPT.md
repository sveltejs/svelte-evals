Create a Svelte 5 text analyzer component that uses the `$derived.by` rune for complex derivations.

The component should have a text input field (initially empty) and use `$derived.by` to calculate word count, character count, and whether the text is considered "long" (more than 15 words). Words are separated by whitespace, and empty text has 0 words; the character count is the full length of the text, spaces included. Include a clear button to reset the text to an empty string.

Use these `data-testid` attributes:

- `text-input`: the text input
- `word-count`: element displaying the word count as `Words: 2`
- `char-count`: element displaying the character count as `Characters: 11`
- `length-indicator`: element displaying `Status: Long text` when the text is long, otherwise `Status: Short text`
- `clear-button`: the clear button

Create the component in `src/routes/+page.svelte` without importing other components
