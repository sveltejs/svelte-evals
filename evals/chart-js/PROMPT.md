Create a Svelte 5 bar chart component that renders its data with Chart.js (the `chart.js` package is already installed).

- Props: data ({label, value}[]), label (string, default "Values")
- The chart is drawn on a `<canvas data-testid="chart">`
- It's a `bar` chart with one label per item of `data` (the item's `label`, in order) and a single dataset whose label is the `label` prop and whose data are the items' `value`s
- The chart must stay up to date: when `data` or `label` change, the chart shows the new values
- There must never be more than one Chart.js chart for the component, and the chart must be destroyed when the component is removed

Create the component in `src/routes/+page.svelte` without importing other components
