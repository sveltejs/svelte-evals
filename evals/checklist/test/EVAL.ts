import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import Checklist from '../src/routes/+page.svelte';

const testItems = [
	{ id: 1, label: 'Item 1' },
	{ id: 2, label: 'Item 2' },
	{ id: 3, label: 'Item 3' },
];

describe('Checklist component', () => {
	test('select all checks all items - click select all, verify all checkboxes are checked', async () => {
		const screen = await render(Checklist, { props: { items: testItems } });
		const items = screen.getByTestId('item-checkbox');
		for (let i = 0; i < 3; i++) {
			await expect.element(items.nth(i)).not.toBeChecked();
		}
		await screen.getByTestId('select-all').click();
		for (let i = 0; i < 3; i++) {
			await expect.element(items.nth(i)).toBeChecked();
		}
	});

	test('select all unchecks all when all selected - when all selected, click select all, verify all unchecked', async () => {
		const screen = await render(Checklist, { props: { items: testItems } });
		const selectAll = screen.getByTestId('select-all');
		const items = screen.getByTestId('item-checkbox');
		await selectAll.click();
		for (let i = 0; i < 3; i++) {
			await expect.element(items.nth(i)).toBeChecked();
		}
		await selectAll.click();
		for (let i = 0; i < 3; i++) {
			await expect.element(items.nth(i)).not.toBeChecked();
		}
	});

	test('indeterminate when partial - check one item, verify select all has indeterminate=true', async () => {
		const screen = await render(Checklist, { props: { items: testItems } });
		const selectAll = screen.getByTestId('select-all');
		await expect.element(selectAll).toHaveProperty('indeterminate', false);
		await screen.getByTestId('item-checkbox').nth(0).click();
		await expect.element(selectAll).toHaveProperty('indeterminate', true);
	});

	test("shows selected count - select 2 items, verify count shows '2 selected'", async () => {
		const screen = await render(Checklist, { props: { items: testItems } });
		const count = screen.getByTestId('selected-count');
		await expect.element(count).toMatchTextContent('0 selected');
		await screen.getByTestId('item-checkbox').nth(0).click();
		await screen.getByTestId('item-checkbox').nth(1).click();
		await expect.element(count).toMatchTextContent('2 selected');
	});

	test('individual item toggle works - click an item, verify it toggles', async () => {
		const screen = await render(Checklist, { props: { items: testItems } });
		const item = screen.getByTestId('item-checkbox').nth(0);
		await expect.element(item).not.toBeChecked();
		await item.click();
		await expect.element(item).toBeChecked();
		await item.click();
		await expect.element(item).not.toBeChecked();
	});

	test('select all not indeterminate when none selected - verify indeterminate is false when none selected', async () => {
		const screen = await render(Checklist, { props: { items: testItems } });
		const selectAll = screen.getByTestId('select-all');
		await expect.element(selectAll).toHaveProperty('indeterminate', false);
		await expect.element(selectAll).not.toBeChecked();
	});

	test('select all not indeterminate when all selected - verify indeterminate is false when all selected', async () => {
		const screen = await render(Checklist, { props: { items: testItems } });
		const selectAll = screen.getByTestId('select-all');
		await selectAll.click();
		await expect.element(selectAll).toHaveProperty('indeterminate', false);
		await expect.element(selectAll).toBeChecked();
	});
});
