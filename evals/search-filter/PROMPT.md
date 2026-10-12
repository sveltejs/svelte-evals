# Search Filter Component

Create a Svelte 5 search filter component with:

- Props: `items` (object[]), `searchFields` (string[]), `children` a Snippet that accepts an item to render the filtered items
- Case-insensitive matching across specified fields
- Display filtered count showing "X results"

## Requirements

- Use `$props()` for component props
- Use `$state()` for the search query
- Use `$derived()` for filtered items and result count
- Use `@render` to render for each filtered item based with `children` prop
- Search input should have `role="searchbox"`
- An item matches when the query is a substring of at least one of its `searchFields` values; an empty query shows all items
- Each filtered item object is passed as the single argument to `children`
- Always show the result count in its own element whose only text is "X results" (e.g., "2 results", "0 results"); never pluralize differently (1 match is "1 results")

Create the component in `src/routes/+page.svelte` without importing other components
