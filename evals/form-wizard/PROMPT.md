Create a Svelte 5 form wizard with:

- Props: steps ({title, fields}[]), where each field is {name: string, label: string, required: boolean}
- Only the current step is rendered, starting from the first one
- Current step title in an element with `data-testid="step-title"`
- Step indicator with `data-testid="step-indicator"` showing the current position, formatted like "Step 1 of 3"
- Each field of the current step wrapped in an element with `data-testid="field-{name}"`, containing its label and a text input with `data-testid="input-{name}"`
- Previous/Next navigation: buttons with `data-testid="prev-button"` and `data-testid="next-button"`; Previous is disabled on the first step; entered values are kept when navigating
- Validate current step before advancing: if a required field is empty, stay on the step and render an error with `data-testid="error-{name}"` for each invalid field (errors are not rendered otherwise)
- Submit on final step: on the last step the Next button is not rendered and a button with `data-testid="submit-button"` is shown instead (it is only rendered on the last step)

Create the component in `src/routes/+page.svelte` without importing other components
