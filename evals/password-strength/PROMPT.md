Create a Svelte 5 password strength checker with:

- Password input (`data-testid="password-input"`) with show/hide toggle button (`data-testid="toggle-visibility"`): the input starts as `type="password"` and switches to `type="text"` when shown
- Strength meter (weak/fair/strong/very strong): the lowercase label is displayed in an element with `data-testid="strength-value"`. Strength is based on the number of criteria met: 0-2 weak, 3 fair, 4 strong, 5 very strong
- Checklist: length>=8, uppercase, lowercase, number, special char. One element per criterion with `data-testid` respectively `criteria-length`, `criteria-uppercase`, `criteria-lowercase`, `criteria-number`, `criteria-special`; each one has the CSS class `met` only when its criterion is satisfied (none are met initially)

Create the component in `src/routes/+page.svelte` without importing other components
