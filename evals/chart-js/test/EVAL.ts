import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import { Chart, type ChartConfiguration } from 'chart.js';
import BarChart from '../src/routes/+page.svelte';

const testData = [
	{ label: 'Apples', value: 3 },
	{ label: 'Bananas', value: 7 },
	{ label: 'Cherries', value: 5 },
];

const updatedData = [
	{ label: 'Dates', value: 2 },
	{ label: 'Elderberries', value: 9 },
];

function get_chart(screen: Awaited<ReturnType<typeof render>>) {
	const canvas = screen.getByTestId('chart').query();
	return canvas instanceof HTMLCanvasElement
		? Chart.getChart(canvas)
		: undefined;
}

function count_charts() {
	return Object.keys(Chart.instances).length;
}

describe('BarChart component', () => {
	test('renders a bar chart of the data on the canvas', async () => {
		const screen = await render(BarChart, { props: { data: testData } });
		await expect.element(screen.getByTestId('chart')).toBeInTheDocument();
		await expect.poll(() => get_chart(screen)).toBeDefined();
		const chart = get_chart(screen)!;
		expect((chart.config as ChartConfiguration).type).toBe('bar');
		expect(chart.data.labels).toEqual(['Apples', 'Bananas', 'Cherries']);
		expect(chart.data.datasets).toHaveLength(1);
		expect(chart.data.datasets[0].label).toBe('Values');
		expect(chart.data.datasets[0].data).toEqual([3, 7, 5]);
	});

	test('uses the label prop for the dataset', async () => {
		const screen = await render(BarChart, {
			props: { data: testData, label: 'Fruit sold' },
		});
		await expect
			.poll(() => get_chart(screen)?.data.datasets[0]?.label)
			.toBe('Fruit sold');
	});

	test('updates the chart when the data changes', async () => {
		const screen = await render(BarChart, { props: { data: testData } });
		await expect.poll(() => get_chart(screen)).toBeDefined();
		await screen.rerender({ data: updatedData });
		await expect
			.poll(() => get_chart(screen)?.data.labels)
			.toEqual(['Dates', 'Elderberries']);
		await expect
			.poll(() => get_chart(screen)?.data.datasets[0]?.data)
			.toEqual([2, 9]);
	});

	test('updates the chart when the label changes', async () => {
		const screen = await render(BarChart, { props: { data: testData } });
		await expect.poll(() => get_chart(screen)).toBeDefined();
		await screen.rerender({ label: 'Fruit sold' });
		await expect
			.poll(() => get_chart(screen)?.data.datasets[0]?.label)
			.toBe('Fruit sold');
		expect(get_chart(screen)!.data.datasets[0].data).toEqual([3, 7, 5]);
	});

	test('keeps a single chart and destroys it on unmount', async () => {
		const initial = count_charts();
		const screen = await render(BarChart, { props: { data: testData } });
		await expect.poll(() => get_chart(screen)).toBeDefined();
		expect(count_charts()).toBe(initial + 1);
		await screen.rerender({ data: updatedData });
		await screen.rerender({ data: testData, label: 'Fruit sold' });
		await expect
			.poll(() => get_chart(screen)?.data.datasets[0]?.label)
			.toBe('Fruit sold');
		expect(count_charts()).toBe(initial + 1);
		const canvas = screen.getByTestId('chart').element() as HTMLCanvasElement;
		await screen.unmount();
		await expect.poll(() => count_charts()).toBe(initial);
		expect(Chart.getChart(canvas)).toBeUndefined();
	});
});
