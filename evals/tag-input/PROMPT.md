Create a Svelte 5 tag input with:

- A text input with `data-testid="tag-input"`; starts with no tags
- Enter/comma creates tag from the trimmed input value and clears the input (the comma is never part of the tag or left in the input; empty values are ignored)
- Each tag is an element with `data-testid="tag"` containing the tag text in an element with `data-testid="tag-text"` and a remove button with `data-testid="remove-tag-button"`
- X button removes tag
- Backspace on empty removes last tag
- Props: maxTags (number, default unlimited), allowDuplicates (boolean, default false)
- When the number of tags reaches maxTags the input is disabled and no more tags can be added
- Unless allowDuplicates is true, a tag equal to an existing one is not added

Create the component in `src/routes/+page.svelte` without importing other components
