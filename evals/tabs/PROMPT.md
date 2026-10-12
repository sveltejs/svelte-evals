Create a Svelte 5 tabs component with:

- Props: tabs ({label: string, content: string}[])
- Click tab to show content; the first tab is active by default
- Only the active tab's content is rendered, in a single panel element with `data-testid="tabpanel"`, `role="tabpanel"` and an `id`
- The tabs container has `data-testid="tablist"` and `role="tablist"`
- Each tab is a button showing the label with `data-testid="tab"`, `role="tab"`, `aria-selected` ("true" for the active tab, "false" otherwise), `aria-controls` equal to the panel's `id`, and `tabindex` "0" for the active tab, "-1" for the others
- Arrow key navigation: ArrowRight/ArrowLeft on a focused tab activates and moves focus to the next/previous tab, wrapping around at both ends
- ARIA roles (tablist, tab, tabpanel)

Create the component in `src/routes/+page.svelte` without importing other components
