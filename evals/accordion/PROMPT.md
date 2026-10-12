Create a Svelte 5 accordion with:

- Props: items ({title, content}[]), single (boolean, default false)
- One `<button data-testid="accordion-button">` per item showing the title; click it to toggle that section
- An open section renders its content in an element with `data-testid="accordion-panel"`; closed sections must not render the panel at all
- All sections start closed; multiple sections can be open at once, unless `single` is true, in which case opening a section closes the others
- ARIA attributes for accessibility: each button has `aria-expanded` ("true" when its section is open, "false" otherwise)

Create the component in `src/routes/+page.svelte` without importing other components
