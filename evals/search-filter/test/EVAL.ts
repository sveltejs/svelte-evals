import { render } from 'vitest-browser-svelte';
import { describe, it, expect } from 'vitest';
import Component from '../src/routes/+page.svelte';
import { createRawSnippet } from 'svelte';
import { toStore } from 'svelte/store';

const children = createRawSnippet<[item: { name: string }]>((item) => ({
	render: () => `<div>${item().name}</div>`,
	setup(element) {
		// Keep the snippet reactive in a hidden plain .ts file using the public API.
		return toStore(() => item().name).subscribe((name) => {
			element.textContent = name;
		});
	},
}));

describe('Search Filter', () => {
	it('filters items based on search query', async () => {
		const items = [{ name: 'Apple' }, { name: 'Banana' }];
		const screen = await render(Component, {
			props: { items, searchFields: ['name'], children },
		});
		await screen.getByRole('searchbox').fill('app');
		await expect
			.element(screen.getByText('Apple', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByText('Banana', { exact: true }))
			.not.toBeInTheDocument();
	});

	it('shows result count', async () => {
		const items = [{ name: 'Apple' }, { name: 'Apricot' }, { name: 'Banana' }];
		const screen = await render(Component, {
			props: { items, searchFields: ['name'], children },
		});
		await screen.getByRole('searchbox').fill('ap');
		await expect
			.element(screen.getByText('2 results', { exact: true }))
			.toBeInTheDocument();
	});

	it('is case insensitive', async () => {
		const items = [{ name: 'Apple' }, { name: 'Banana' }];
		const screen = await render(Component, {
			props: { items, searchFields: ['name'], children },
		});
		await screen.getByRole('searchbox').fill('APPLE');
		await expect
			.element(screen.getByText('Apple', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByText('1 results', { exact: true }))
			.toBeInTheDocument();
	});

	it('searches multiple fields', async () => {
		const items = [
			{ name: 'Apple', description: 'A red fruit' },
			{ name: 'Banana', description: 'A yellow fruit' },
		];
		const screen = await render(Component, {
			props: { items, searchFields: ['name', 'description'], children },
		});
		await screen.getByRole('searchbox').fill('yellow');
		await expect
			.element(screen.getByText('Banana', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByText('Apple', { exact: true }))
			.not.toBeInTheDocument();
	});

	it('shows all items with empty query', async () => {
		const items = [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }];
		const screen = await render(Component, {
			props: { items, searchFields: ['name'], children },
		});
		for (const item of items) {
			await expect
				.element(screen.getByText(item.name, { exact: true }))
				.toBeInTheDocument();
		}
		await expect
			.element(screen.getByText('3 results', { exact: true }))
			.toBeInTheDocument();
	});

	it('shows zero count for no results', async () => {
		const items = [{ name: 'Apple' }, { name: 'Banana' }];
		const screen = await render(Component, {
			props: { items, searchFields: ['name'], children },
		});
		await screen.getByRole('searchbox').fill('xyz');
		await expect
			.element(screen.getByText('0 results', { exact: true }))
			.toBeInTheDocument();
	});
});
