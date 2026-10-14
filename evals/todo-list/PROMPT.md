Create a Svelte 5 todo list with:

- A form (`data-testid="todo-form"`) containing a text input to add todos (`data-testid="todo-input"`) and a submit button (`data-testid="add-button"`)
- The list starts empty. Submitting adds a new, not completed todo at the end of the list and clears the input. Submitting an empty (or whitespace only) input adds nothing
- Each todo is rendered in an element with `data-testid="todo-item"` (no such element is rendered when there are no todos) containing:
    - Checkbox to toggle complete (`data-testid="todo-checkbox"`), checked when the todo is completed
    - The todo text (`data-testid="todo-text"`)
    - Delete button per todo (`data-testid="delete-button"`) that removes that todo
- Display remaining count: an element with `data-testid="remaining-count"` showing the number of not completed todos in the format `1 item left` / `2 items left`

Create the component in `src/routes/+page.svelte` without importing other components
