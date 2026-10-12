Create a Svelte 5 button component with:

- Props: variant (primary/secondary/danger, default primary), size (sm/md/lg, default md), disabled (boolean, default false)
- Renders a single `<button>` with the variant and size values applied as CSS classes (e.g. `class="primary md"`)
- Forward click events to parent via an `onclick` callback prop; a disabled button must not fire it
- Basic styling for each variant

Create the component in `src/routes/+page.svelte` without importing other components
